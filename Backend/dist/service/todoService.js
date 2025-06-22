import Todo from '../models/todoModel.js';
import { redisClient } from '../config/redis.js';
import { airtableTable } from '../config/airtable.js';
// Check if todo exists in MongoDB
const checkInMongoDB = async (todo_id) => {
    const existing = await Todo.findOne({ todo_id });
    return !!existing;
};
// Check if todo exists in Redis
const checkInRedis = async (todo_id) => {
    const exists = await redisClient.exists(`todo:${todo_id}`);
    return exists === 1;
};
// Fetch todos from Airtable
const fetchTodosFromAirtable = async () => {
    const records = await airtableTable.select({ view: 'Grid view', maxRecords: 100 }).firstPage();
    const todos = await Promise.all(records.map(async (record) => {
        const todo_id = record.fields.todo_id || record.id;
        const todo_name = record.fields.todo_name || 'Untitled';
        const created_at = record.fields.created_at || new Date().toISOString();
        const inMongo = await checkInMongoDB(todo_id);
        const inRedis = !inMongo && await checkInRedis(todo_id);
        return {
            todo_id,
            todo_name,
            created_at,
            inMongo,
            inRedis,
            completed: inMongo,
        };
    }));
    return todos;
};
// Mark as done (store in Redis)
const moveTodoToRedis = async ({ airtableRecordId, todo_name }) => {
    const key = `todo:${airtableRecordId}`;
    const value = JSON.stringify({ todo_id: airtableRecordId, todo_name });
    const alreadyExists = await redisClient.exists(key);
    if (alreadyExists) {
        throw new Error('Todo already exists in Redis');
    }
    // ioredis syntax
    await redisClient.set(key, value, 'EX', 3600); // TTL = 1 hour
};
// Move to MongoDB from Redis
const moveTodoToDatabase = async ({ airtableRecordId }) => {
    const key = `todo:${airtableRecordId}`;
    // Check if todo exists in Redis
    const exists = await redisClient.exists(key);
    if (!exists)
        throw new Error('Todo not found in Redis');
    // Check if already exists in MongoDB
    const alreadyInDb = await checkInMongoDB(airtableRecordId);
    if (alreadyInDb)
        throw new Error('Todo already exists in MongoDB');
    // Fetch todo data from Redis
    const data = await redisClient.get(key);
    if (!data)
        throw new Error('Failed to retrieve todo data from Redis');
    let todoData;
    try {
        todoData = JSON.parse(data); // { todo_id, todo_name }
    }
    catch {
        throw new Error('Invalid todo data format in Redis');
    }
    const todo = new Todo({
        todo_id: todoData.todo_id,
        todo_name: todoData.todo_name,
        created_at: new Date().toISOString(),
    });
    await todo.save();
    await redisClient.del(key); // remove from Redis
};
export { fetchTodosFromAirtable, moveTodoToRedis, moveTodoToDatabase, };
