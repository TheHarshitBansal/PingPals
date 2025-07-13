import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import otpGenerator from "otp-generator";
import sendMail from "../services/mailer.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import otpTemplate from "../templates/sendOTP.template.js";
import resetPasswordTemplate from "../templates/resetPassword.template.js";
import crypto from "crypto";
import { deleteFile } from "../middlewares/upload.middleware.js";

//INFO: Sign JWT token
export const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

//INFO: Register a new user
export const register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).json({
      message: "Please provide a name, username, email, and password",
    });
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser && existingUser.verified) {
    return res
      .status(400)
      .json({ message: "User with this username or email already exists" });
  } else if (existingUser && !existingUser.verified) {
    existingUser.name = name;
    existingUser.username = username;
    existingUser.email = email;
    existingUser.password = password;
    await existingUser.save();
    req.id = existingUser._id;
  } else {
    const user = await User.create({ name, username, email, password });
    if (!user) {
      return res.status(400).json({ message: "User could not be created" });
    }
    await user.save();
    req.id = user._id;
  }
  await sendOTP(req, res);
});

//INFO: Send OTP to user's email
export const sendOTP = asyncHandler(async (req, res) => {
  if (!req.id && !req.body.username) {
    return res.status(400).json({ message: "User ID is missing" });
  }

  const user =
    (await User.findById(req.id)) ||
    (await User.findOne({ username: req.body.username }));
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = otpGenerator.generate(4, {
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes
  await user.save({ validateBeforeSave: false });

  try {
    await sendMail({
      name: user.name,
      email: user.email,
      subject: "Verify your email for PingPals",
      html: otpTemplate(user.name, otp),
    });
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ message: "Error sending OTP" });
  }
});

//INFO: Verify OTP
export const verifyOTP = asyncHandler(async (req, res) => {
  const { username, otp } = req.body;

  const user = await User.findOne({
    username,
    otpExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "User not found or OTP expired" });
  }

  if (user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.verified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ new: true, validateModifiedOnly: true });

  const token = signToken(user._id);
  const sendUser = await User.findById(user.id).select(
    "name avatar username email about socket_id friends requests status"
  );

  res
    .status(200)
    .json({ token, message: "OTP verified successfully", user: sendUser });
});

//INFO: Login a user
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Please provide a username or email and password" });
  }

  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  }).select("+password");
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  if (!(await user.comparePassword(password, user.password))) {
    return res.status(401).json({ message: "Invalid password" });
  }

  user.password = undefined;
  const token = signToken(user._id);
  const sendUser = await User.findById(user.id).select(
    "name avatar username email about socket_id friends requests status"
  );

  res.status(200).json({ token, message: "Login successful", user: sendUser });
});

//INFO: Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.passwordChangedAt && user.passwordChangedAt < decoded.iat) {
      return res
        .status(401)
        .json({ message: "Password changed. Please login again" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
});

//INFO: Forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Please provide an email" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = await user.createPasswordResetToken();
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

  try {
    await sendMail({
      name: user.name,
      email: user.email,
      subject: "Reset your password for PingPals",
      html: resetPasswordTemplate(user.name, resetUrl),
    });
    res.status(200).json({ message: "Reset URL sent successfully" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ message: "Error sending email" });
  }
});

//INFO: Reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { password, confirmPassword, token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Invalid token" });
  }

  if (!password || !confirmPassword) {
    return res
      .status(400)
      .json({ message: "Please provide a password and confirm password" });
  }

  const resetToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid token or token expired" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save({ new: true, validateModifiedOnly: true });
  res.status(200).json({ message: "Password reset successfully" });
});

//INFO: Update User's Profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { name, username, about } = req.body;
  const img = req?.file ? req.file.path : null;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (img && user.avatar) {
    const public_id = "PingPals/" + user.avatar.split("/").pop().split(".")[0];
    await deleteFile(public_id);
  }

  user.name = name || user.name;
  user.avatar = img || user.avatar;
  user.username = username || user.username;
  user.about = about || user.about;

  await user.save({ validateModifiedOnly: true });
  const sendUser = await User.findById(user.id).select(
    "name avatar username email about socket_id friends requests status"
  );

  res
    .status(200)
    .json({ user: sendUser, message: "Profile updated successfully" });
});

//INFO: Change Password
export const changePassword = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      message:
        "Please provide current password, new password, and confirm new password",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (!id) {
    return res.status(400).json({ message: "Invalid token" });
  }

  const user = await User.findById(id).select("+password");
  if (!(await user.comparePassword(currentPassword, user.password))) {
    return res.status(401).json({ message: "Invalid password" });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ message: "Password changed successfully" });
});

//INFO: Get User Profile
export const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id).select(
    "name avatar username email about socket_id friends requests status"
  );

  res.status(200).json({ user, message: "User Details Fetched Successfully" });
});

//INFO: Get Friends
export const getFriends = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id).populate(
    "friends",
    "id name username avatar about"
  );
  const friends = user.friends;

  res.status(200).json({ friends, message: "Friends fetched successfully" });
});

//INFO: Get Requests
export const getRequests = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id).populate(
    "requests",
    "id name username avatar about"
  );
  const requests = user.requests;

  res.status(200).json({ requests, message: "Requests fetched successfully" });
});

//INFO: Find People
export const findPeople = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Please provide a name to search" });
  }
  const currentUserId = req.user.id;

  const people = await User.find({
    $or: [
      { name: { $regex: name, $options: "i" } },
      { username: { $regex: name, $options: "i" } },
    ],
    _id: { $ne: currentUserId },
  }).select("id name username avatar about requests");

  res.status(200).json({ people, message: "People fetched successfully" });
});
