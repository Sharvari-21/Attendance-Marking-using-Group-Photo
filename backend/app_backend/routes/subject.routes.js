import express from "express";
import { createSubject,getAllSubjects,getSubjectsByTeacher } from "../controllers/subject.controller.js";
const subjectRouter = express.Router();
subjectRouter.post("/createsubject", createSubject);
subjectRouter.get("/getallsubject", getAllSubjects);
subjectRouter.get("/getsubjectbyteacher", getSubjectsByTeacher);
export { subjectRouter };
