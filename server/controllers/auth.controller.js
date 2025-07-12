import axios from "axios";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import User from "../models/user.model.js";
import { signToken } from "./user.controller.js";

export const handleGoogleAuth = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${process.env.FRONTEND_URL}/auth/google`,
    grant_type: "authorization_code",
  });

  const { access_token } = tokenRes.data;

  const userInfo = await axios.get(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );

  const { email, name, picture } = userInfo.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      username: email.split("@")[0],
      avatar: picture,
      verified: true,
      provider: "google",
      name,
    });
  }

  const token = signToken(user._id);
  res.status(200).json({
    message: "Successfully authenticated with Google",
    user,
    token,
  });
});

export const handleGithubAuth = asyncHandler(async (req, res) => {
  const { code } = req.body;

  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    },
    {
      headers: { Accept: "application/json" },
    }
  );

  const { access_token } = tokenRes.data;

  // Fetch user info from GitHub
  const userRes = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const emailRes = await axios.get("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const { login, name, avatar_url } = userRes.data;
  const email =
    emailRes.data.find((email) => email.primary)?.email ||
    `${login}@github.com`;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      username: login,
      avatar: avatar_url,
      verified: true,
      provider: "github",
      name: name || login,
    });
  }

  const token = signToken(user._id);
  res.status(200).json({
    message: "Successfully authenticated with GitHub",
    user,
    token,
  });
});
