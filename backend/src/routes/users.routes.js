import { Router } from "express";
import { register, login, profile, createMeeting, verifyMeeting } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/profile").get(authMiddleware, profile);
router.route("/create-meeting").post(createMeeting);
router.route("/verify-meeting").post(verifyMeeting);
export default router;


