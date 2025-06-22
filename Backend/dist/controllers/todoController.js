import { response } from "../errorHandler/responsehandler.js";
import * as todoService from "../service/todoService.js";
// fetchTodos
export const fetchTodos = async (req, res) => {
    try {
        const todos = await todoService.fetchTodosFromAirtable();
        return response(res, 200, "Todos fetched successfully", todos);
    }
    catch (err) {
        console.error(err);
        return response(res, 500, "Failed to fetch todos from Airtable");
    }
};
// markTodoDone
export const markTodoDone = async (req, res) => {
    try {
        const { todo_id, todo_name } = req.body;
        if (!todo_id || !todo_name) {
            return response(res, 400, "todo_id and todo_name are required");
        }
        await todoService.moveTodoToRedis({ airtableRecordId: todo_id, todo_name });
        return response(res, 200, "Todo marked as done and saved to Redis");
    }
    catch (err) {
        console.error(err);
        return response(res, 500, "Failed to mark todo in Redis");
    }
};
// moveToDatabase
export const moveToDatabase = async (req, res) => {
    try {
        const { todo_id } = req.body;
        if (!todo_id) {
            return response(res, 400, "todo_id is required");
        }
        await todoService.moveTodoToDatabase({ airtableRecordId: todo_id });
        return response(res, 201, "Todo moved to MongoDB and removed from Redis");
    }
    catch (err) {
        console.error("Error in moveToDatabase:", err.message);
        return response(res, 500, `Failed to move todo to DB: ${err.message}`);
    }
};
