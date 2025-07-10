import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    validate: {
      validator: (value) => /^[a-z0-9_-]{3,30}$/.test(value),
      message:
        "Username can only contain letters, numbers, underscores, and hyphens",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: {
      validator: (value) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value),
      message: "Invalid email address",
    },
  },
  password: {
    type: String,
    required: [
      function () {
        return this.provider === "local";
      },
      "Password is required.",
    ],
    trim: true,
    select: false,
    validate: {
      validator: (value) =>
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(value),
      message:
        "Password must be at least 8 characters with one uppercase, one lowercase, and one number",
    },
  },
  avatar: String,
  about: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  verified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    validate: {
      validator: (value) => /^\d{4}$/.test(value),
      message: "OTP must be a 4-digit number",
    },
  },
  otpExpires: Date,
  socket_id: String,
  friends: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: ["Online", "Offline"],
    default: "Online",
  },
  requests: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  provider: {
    type: String,
    enum: ["local", "google", "github"],
    default: "local",
  },
});

// Hash password and OTP before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = Date.now();
  }

  this.updatedAt = Date.now();
  next();
});

// Compare password method
userSchema.methods = {
  comparePassword: async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  },
  createPasswordResetToken: async function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = await crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await this.save({ validateBeforeSave: false });
    return resetToken;
  },
};

const User = model("User", userSchema);
export default User;
