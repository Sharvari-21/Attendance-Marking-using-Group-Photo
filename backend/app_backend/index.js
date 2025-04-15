import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import TestRouter from "./routes/TestRoute.js";
import {StudentRouter} from "./routes/student.routes.js";
import {teacherRouter} from "./routes/teacher.routes.js";
import {subjectRouter} from "./routes/subject.routes.js";
import {ClassroomRouter} from "./routes/classroom.routes.js";
import {attendanceRouter} from "./routes/attendance.routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use("/test", TestRouter); 
app.use("/api/students", StudentRouter);
app.use("/api/teachers", teacherRouter);
app.use("/api/subjects", subjectRouter);
app.use("/api/classrooms", ClassroomRouter);
app.use("/api/attendance", attendanceRouter);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
