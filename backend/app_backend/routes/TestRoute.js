import express from "express";
import { Test } from "../controllers/TestController.js";
const TestRouter = express.Router();
TestRouter.get("/", Test);
export default TestRouter;