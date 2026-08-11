import httpStatus from "http-status";
import { User } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "No token provided" });
    }

    try {
        const user = await User.findOne({ token: token }, { name: true, username: true});
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found or invalid token" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${err.message}` });
    }
};
