import express from "express";
import { markAttendance,getAttendanceByLecture,getStudentAttendance } from "../controllers/attendance.controller.js";
const attendanceRouter = express.Router();
attendanceRouter.post("/markattendance", markAttendance);
attendanceRouter.get("/getattendancebylecture", getAttendanceByLecture);
attendanceRouter.get("/getstudentattendance", getStudentAttendance);
export { attendanceRouter };
