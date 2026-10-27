
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API = "http://localhost:5000/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API);
      setTasks(res.data);
    } catch (error) {
      setMessage("Cannot connect to server. Check server.js and MongoDB.");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const createTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setMessage("Please enter a task title.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(API, {
        title: title.trim()
      });

      setTasks((prev) => [...prev, res.data]);
      setTitle("");
      setMessage("Task added successfully!");
    } catch (error) {
      console.error("Add task error:", error);
      setMessage(
        error.response?.data?.message ||
        "Task not added. Check server and MongoDB."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id, status) => {
    try {
      const res = await axios.patch(`${API}/${id}`, { status });

      setTasks((prev) =>
        prev.map((task) => task._id === id ? res.data : task)
      );
      setMessage("Task status updated!");
    } catch (error) {
      console.error(error);
      setMessage("Unable to update task.");
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      setTasks((prev) => prev.filter((task) => task._id !== id));
      setMessage("Task deleted successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete task.");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Task Manager</h1>

      <form onSubmit={createTask} className="mb-3">
        <div className="input-group">
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Task"}
          </button>
        </div>
      </form>

      {message && (
        <p role="status" className="mb-3">{message}</p>
      )}

      <div className="row">
        {["Pending", "Ongoing", "Completed"].map((status) => (
          <div className="col-md-4 mb-3" key={status}>
            <div className="card h-100">
              <div className="card-header">{status} Tasks</div>

              <div className="card-body">
                {tasks.filter((task) => task.status === status).length === 0
                  ? <p>No tasks</p>
                  : tasks
                      .filter((task) => task.status === status)
                      .map((task) => (
                        <div className="card mb-2 p-2" key={task._id}>
                          <b>{task.title}</b>
                          <p>Status: {task.status}</p>

                          {task.status !== "Ongoing" && (
                            <button
                              className="btn btn-info btn-sm m-1"
                              onClick={() =>
                                updateTask(task._id, "Ongoing")
                              }
                            >
                              Ongoing
                            </button>
                          )}

                          {task.status !== "Completed" && (
                            <button
                              className="btn btn-success btn-sm m-1"
                              onClick={() =>
                                updateTask(task._id, "Completed")
                              }
                            >
                              Completed
                            </button>
                          )}

                          <button
                            className="btn btn-danger btn-sm m-1"
                            onClick={() => deleteTask(task._id)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;