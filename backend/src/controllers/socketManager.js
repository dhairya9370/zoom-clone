import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { Meeting } from "../models/meeting.model.js";

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        }
    });
    io.on("connection", (socket) => {
        console.log("A user connected on socket!");

        // // create room
        // socket.on("create-room", async (user) => {
        //     const code = uuidv4();
        //     try {
        //         const newMeeting = new Meeting({
        //             host_id: socket.userId,
        //             meetingCode: code
        //         });
        //         await newMeeting.save();
        //         socket.join(code);
        //         socket.emit("room-created", { success: true, code: code });
        //     } catch (err) {
        //         socket.emit("room-created", { success: false, error: err.message || err });
        //     }
        // });

        // join room
        socket.on("join-room", async (name, code) => {
            try {
                const meeting = await Meeting.findOne({ meetingCode: code });
                if (meeting) {
                    socket.join(code);
                    socket.emit("room-joined", { success: true, code: code });
                } else {
                    socket.emit("room-joined", { success: false, error: "Meeting not found" });
                }
            } catch (err) {
                socket.emit("room-joined", { success: false, error: err.message || err });
            }
        });

        // user ready in meeting UI
        socket.on("ready-in-room", (name, code, isVideoOff) => {
            if (code) {
                console.log(`User [${name}] (${socket.id}) is ready in meeting room [${code}], videoOff: ${isVideoOff}`);
                socket.to(code).emit("new-user-joined", { name: name, socketId: socket.id, isVideoOff });
            }
        });

        // leave room
        socket.on("leave-room", (name, code) => {
            if (code) {
                socket.leave(code);
                socket.emit("left-room", { success: true });
                socket.to(code).emit("user-left-room", { name: name, socketId: socket.id });
            }
        });

        // WebRTC Signaling Relays
        socket.on("signal-offer", ({ to, offer, name, isVideoOff }) => {
            console.log(`Relaying signal-offer from [${socket.id}] to [${to}]`);
            socket.to(to).emit("signal-offer", { from: socket.id, offer, name, isVideoOff });
        });

        socket.on("signal-answer", ({ to, answer, isVideoOff }) => {
            console.log(`Relaying signal-answer from [${socket.id}] to [${to}]`);
            socket.to(to).emit("signal-answer", { from: socket.id, answer, isVideoOff });
        });

        socket.on("toggle-video", ({ roomCode, isVideoOff }) => {
            console.log(`User [${socket.id}] toggled video in room [${roomCode}] to: ${isVideoOff}`);
            socket.to(roomCode).emit("user-toggle-video", { socketId: socket.id, isVideoOff });
        });

        socket.on("toggle-screen-share", ({ roomCode, isScreenSharing }) => {
            console.log(`User [${socket.id}] toggled screen sharing in room [${roomCode}] to: ${isScreenSharing}`);
            socket.to(roomCode).emit("user-toggle-screen-share", { socketId: socket.id, isScreenSharing });
        });

        socket.on("signal-candidate", ({ to, candidate }) => {
            socket.to(to).emit("signal-candidate", { from: socket.id, candidate });
        });

        socket.on("remove-member", () => {
            // host can remove any member
        });

        socket.on("destroy-room", () => {
            // if no one in room, or if host explicitly ends meeting
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    return io;
};