import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const register = async (req, res) => {
    const { name, username, password } = req.body || {};
    if (!name || !username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide all fields" });
    }
    try {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "Username already exists" });
        }
        const hashedPass = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(20).toString("hex");
        const newUser = new User({
            name: name,
            username: username,
            password: hashedPass,
            token: token,
        });
        await newUser.save();
        return res.status(httpStatus.CREATED).json({
            token: token,
            user: { name: newUser.name, username: newUser.username },
            message: "User Registered Successfully"
        });
    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${err.message}` });
    }
}

const login = async (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide all fields" });
    }
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "Username incorrect or User Not Registered" });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const token = crypto.randomBytes(20).toString("hex");
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({
                token: token,
                user: { name: user.name, username: user.username },
                message: "User Login Successfull"
            });
        }
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Incorrect Password" });
    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${err.message}` });
    }
}

const profile = async (req, res) => {
    try {
        if (req.user) {
            return res.status(httpStatus.OK).json({ user: req.user, message: "User profile fetched successfully" });
        }
        return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Something went wrong: ${err.message}` });
    }
};

const createMeeting = async (req, res) => {
    const code = uuidv4();
    try {
        let hostId = null;
        const token = req.headers.authorization?.split(" ")[1] || req.headers.authorization;
        if (token) {
            const foundUser = await User.findOne({ token: token });
            if (foundUser) hostId = foundUser._id;
        }
        const newMeeting = new Meeting({
            ...(hostId ? { host_id: hostId } : {}),
            meetingCode: code
        });
        await newMeeting.save();

        return res.status(httpStatus.CREATED).json({
            success: true,
            meetingCode: code,
            code: code,
            message: "Meeting created successfully"
        });
    } catch (err) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: `Something went wrong: ${err.message}`
        });
    }
};
const verifyMeeting=async(req,res)=>{
    const{code}=req.body;
    if(!code){
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide meeting code" });
    }
    try{
        const meeting = await Meeting.findOne({ meetingCode: code });
        if(!meeting){
            return res.status(httpStatus.NOT_FOUND).json({success:false, message: "Meeting not found" });
        }
        return res.status(httpStatus.OK).json({ success: true, message: "Meeting verified successfully" });
    }catch(err){
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({success:false, message: `Something went wrong: ${err.message}` });
    }
}
export { register, login, profile, createMeeting,verifyMeeting };

