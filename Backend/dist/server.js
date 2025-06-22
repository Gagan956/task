import express from "express";
import "dotenv/config";
import { connectDB } from "./config/DB.js";
import cors from "cors";
import todoRouter from "./routers/todoRouter.js";
//connect to db
connectDB();
//middleware
const app = express();
app.use(cors({
    origin: "*",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}));
app.use(express.json());
//routes
app.use("/api/todos", todoRouter);
//checking Purpose of this code
app.get('/', (req, res) => {
    res.send('Hello World!');
    // console.log("Hello World!");
});
//start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Exit handler
const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.log('Server closed');
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
};
// Unexpected error handler
const unexpectedErrorHandler = (error) => {
    console.error(error);
    exitHandler();
};
process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);
process.on('SIGTERM', () => {
    console.info('SIGTERM received');
    if (server) {
        server.close();
    }
});
