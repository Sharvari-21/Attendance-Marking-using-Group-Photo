import express from "express";
import { signupStudent,loginStudent,getStudentProfile } from "../controllers/student.controller.js";
const StudentRouter = express.Router();
StudentRouter.post("/signup", signupStudent);
StudentRouter.post("/login", loginStudent);
StudentRouter.get("/getprofile", getStudentProfile);
export { StudentRouter };
