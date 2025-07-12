import express from "express";
import {
  handleGithubAuth,
  handleGoogleAuth,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/google", handleGoogleAuth);
router.post("/github", handleGithubAuth);
export default router;
