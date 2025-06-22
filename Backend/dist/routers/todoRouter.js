import { Router } from "express";
import * as todoController from "../controllers/todoController.js";
const router = Router();
router.get("/fetch-from-airtable", todoController.fetchTodos);
router.post("/mark-as-done", todoController.markTodoDone);
router.post("/move-to-db", todoController.moveToDatabase);
export default router;
