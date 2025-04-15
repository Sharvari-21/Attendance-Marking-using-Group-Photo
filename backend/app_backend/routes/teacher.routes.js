import express from "express";
import { signupTeacher,loginTeacher,getTeacherProfile } from "../controllers/teacher.controller.js";
const teacherRouter = express.Router();
teacherRouter.post("/login", loginTeacher);
teacherRouter.post("/signup", signupTeacher);
teacherRouter.get("/getprofile", getTeacherProfile);
export { teacherRouter };
