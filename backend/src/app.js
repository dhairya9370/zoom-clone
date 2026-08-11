import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: "./src/.env" });
import express from "express";
import {createServer} from "node:http";
import mongoose from "mongoose";
import {connectToSocket} from "./controllers/socketManager.js"
import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import httpStatus from "http-status";
const app =express();
const server=createServer(app);
const io= connectToSocket(server);

app.set("port",(process.env.PORT || 2100));
app.use(cors());
app.use(express.json({limit:"100kb"}));
app.use(express.urlencoded({limit:"100kb",extended:true}));
app.use("/api/v1/users",userRoutes);
app.get("/",(req,res)=>{
    res.status(httpStatus.OK).json({message:"Welcome to Zoom Clone Backend"});
});

async function start(){
    const connectionDB=await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log(`MongoDB Connection on host${connectionDB.connection.host}`);
    
    const PORT = app.get("port");
    server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://0.0.0.0:${PORT} (Accessible on LAN IP:2100)`);
    });
}
start();
