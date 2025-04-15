import express from "express";
import { getAllClassrooms,getClassroomById,createClassroom } from "../controllers/classroom.controller.js";
const ClassroomRouter = express.Router();
ClassroomRouter.get("/getclassroom", getAllClassrooms);
ClassroomRouter.get("/getclassroombyid", getClassroomById);
ClassroomRouter.post("/createclassroom", createClassroom);
export { ClassroomRouter };
