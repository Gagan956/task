import Redis from 'ioredis';
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
export const redisClient = new Redis(redisUrl);
redisClient.on("connect", () => {
    console.log("Redis Connected");
});
export const markAsDone = async (todo_id, todo_name) => {
    await redisClient.set(todo_id, todo_name);
};
export const getFromRedis = async (todo_id) => {
    return await redisClient.get(todo_id);
};
