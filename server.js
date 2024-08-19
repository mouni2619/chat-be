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
import cors from "cors";  // Import the cors package


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
const PORT = process.env.PORT || 5000;

// Initialize the Express app
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json()); // to parse the incoming requests with JSON payloads
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get('/', (req, res) => {
    res.send('Welcome to the root endpoint!');
});
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(PORT, async () => {
    try {
        await connectToMongoDB();
        console.log(`Server Running on port ${PORT}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
    }
});
