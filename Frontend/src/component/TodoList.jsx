import { useState } from "react";
import axios from "axios";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [doneTodos, setDoneTodos] = useState({});
  const [movedTodos, setMovedTodos] = useState({});
  const [loading] = useState(false);
  const [todosLoaded, setTodosLoaded] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");
  const [fetchingFromAirtable, setFetchingFromAirtable] = useState(false); // NEW

  const API_URL = "https://task-ojev.onrender.com/api/todos";

  const fetchTodos = async () => {
    setFetchingFromAirtable(true); // NEW
    setMessage("");
    try {
      const res = await axios.get(`${API_URL}/fetch-from-airtable`);
      setTodos(res.data.data);
      setTodosLoaded(true);

      // Init Redis/Mongo state
      const redisStatus = {};
      const mongoStatus = {};
      res.data.data.forEach((todo) => {
        if (todo.inRedis) redisStatus[todo.todo_id] = true;
        if (todo.inMongo) mongoStatus[todo.todo_id] = true;
      });
      setDoneTodos(redisStatus);
      setMovedTodos(mongoStatus);
    } catch (err) {
      console.error("Error fetching todos:", err);
      setMessage(" Failed to fetch todos.");
    } finally {
      setFetchingFromAirtable(false); // NEW
    }
  };

  const markAsDone = async (todo) => { 
    try {
      setProcessingId(todo.todo_id);
      setMessage("");
      await axios.post(`${API_URL}/mark-as-done`, {
        todo_id: todo.todo_id,
        todo_name: todo.todo_name,
      }); 
      setDoneTodos((prev) => ({ ...prev, [todo.todo_id]: true }));
      setMessage("✅ Marked as done and saved to Redis.");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "❌ Failed to mark todo as done.";
      if (errorMsg.includes("already exists in Redis")) {
        setDoneTodos((prev) => ({ ...prev, [todo.todo_id]: true }));
        setMessage("⚠️ Todo already in Redis.");
      } else if (errorMsg.includes("already exists in MongoDB")) {
        setMovedTodos((prev) => ({ ...prev, [todo.todo_id]: true }));
        setMessage("⚠️ Todo already exists in MongoDB.");
      } else {
        setMessage(errorMsg);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const moveToDatabase = async (todo) => {
    try {
      setProcessingId(todo.todo_id);
      setMessage("");
      await axios.post(`${API_URL}/move-to-db`, {
        todo_id: todo.todo_id,
        todo_name: todo.todo_name,
      });
      setMovedTodos((prev) => ({ ...prev, [todo.todo_id]: true }));
      setMessage("✅ Todo moved to MongoDB.");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "❌ Failed to move todo to DB.";
      if (errorMsg.includes("already exists in MongoDB")) {
        setMovedTodos((prev) => ({ ...prev, [todo.todo_id]: true }));
        setMessage("⚠️ Already in MongoDB.");
      } else if (errorMsg.includes("not found in Redis")) {
        setMessage("⚠️ Todo not found in Redis. Please mark it as done first.");
      } else {
        setMessage(errorMsg);
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📘 My To-Do List</h1>
      </header>

      <main className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6 text-center">
          {!todosLoaded ? (
            <>
              {fetchingFromAirtable ? (
                <div className="flex flex-col items-center py-6">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                  <p className="text-blue-800 font-semibold text-base">
                    Fetching data from Airtable... Please wait.
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-gray-700">
                    Click the button to load todos from Airtable
                  </p>
                  <button
                    onClick={fetchTodos}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    🔄 Fetch Todos from Airtable
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button
                onClick={fetchTodos}
                className="mb-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
              >
                🔁 Refresh Todos
              </button>

              {loading ? (
                <div className="flex justify-center py-4">
                  <span className="text-blue-600 font-medium text-base">
                    ⏳ Loading todos...
                  </span>
                </div>
              ) : (
                <ul className="space-y-4">
                  {todos.length === 0 ? (
                    <li className="text-gray-500 text-center text-base">No todos found.</li>
                  ) : (
                    todos.map((todo) => {
                      const id = todo.todo_id;
                      const isDone = doneTodos[id];
                      const isMoved = movedTodos[id];

                      return (
                        <li
                          key={id}
                          className={`flex justify-between items-center p-4 rounded-lg shadow ${
                            isMoved
                              ? "bg-green-100"
                              : isDone
                              ? "bg-yellow-100"
                              : "bg-gray-50"
                          }`}
                        >
                          <div>
                            <p className="text-lg font-semibold text-gray-800">
                              {isMoved ? <s>{todo.todo_name}</s> : todo.todo_name}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {isMoved && (
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                                  📗 In MongoDB
                                </span>
                              )}
                              {isDone && !isMoved && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
                                  📕 In Redis
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {processingId === id ? (
                              <span className="animate-spin text-blue-600 text-lg">⏳</span>
                            ) : isMoved ? (
                              <button
                                disabled
                                className="px-3 py-1 bg-gray-400 text-white rounded cursor-not-allowed"
                              >
                                ✅ Completed
                              </button>
                            ) : isDone ? (
                              <button
                                onClick={() => moveToDatabase(todo)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                              >
                                ⬇️ Move to DB
                              </button>
                            ) : (
                              <button
                                onClick={() => markAsDone(todo)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                              >
                                ✔️ Mark Done
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
            </>
          )}
        </div>

        {message && (
          <div
            className={`mt-6 px-4 py-2 rounded text-center font-medium ${
              message.includes("✅")
                ? "bg-green-100 text-green-800"
                : message.includes("❌")
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {message}
          </div>
        )}
      </main>
    </div>
  );
}
