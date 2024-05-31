import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import { writeFileSync } from "fs";

import connectToMongoDB from "./db/connectToMongoDB.js";
import { app, server } from "./socket/socket.js";
import crypto from 'crypto';


dotenv.config();


// Check if JWT_SECRET is not set
if (!process.env.JWT_SECRET) {
    // Generate a random 32-byte key
    const secretKey = crypto.randomBytes(32).toString("hex");

    // Update .env file with the new secret key
    writeFileSync(".env", `JWT_SECRET=${secretKey}\n`, { flag: "a" });

    // Update process.env to use the new secret key
    process.env.JWT_SECRET = secretKey;
}

const __dirname = path.resolve();
// PORT should be assigned after calling dotenv.config() because we need to access the env variables. Didn't realize while recording the video. Sorry for the confusion.
const PORT = process.env.PORT || 5000;

app.use(express.json()); // to parse the incoming requests with JSON payloads (from req.body)
app.use(cookieParser());
app.get('/', (req, res) => {
    res.send('Welcome to the root endpoint!');
  });
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(PORT, () => {
	connectToMongoDB();
	console.log(`Server Running on port ${PORT}`);
});
