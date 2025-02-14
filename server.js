const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const app = express();
const PORT = 5000;

// Connect to SQLite database
const dbPath = path.join(__dirname, "./db/database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to SQLite database.");

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, "./db/schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    db.exec(schemaSQL, function (err) {
      if (err) {
        console.error("Error executing schema.sql:", err.message);
      } else {
        console.log("Database schema applied.");
      }
    });
  }
});

// Middleware to parse JSON
app.use(express.json());
app.use(cors());
// // Import routes
// const taskRoutes = require("../routes/tasks");
// app.use("/tasks", taskRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/todos", (req, res) => {
  const dbQuery = `select * from tasks;`;
  db.all(dbQuery, [], function (err, rows) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
      rows.map((eachItem) => console.log(eachItem));
    }
  });
});

app.delete("/todos/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM tasks WHERE id = ?;", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Todo deleted" });
  });
});
app.post("/todos", (req, res) => {
  const { newTodoTitle } = req.body;
  console.log(newTodoTitle);
  db.run("INSERT INTO tasks(title) VALUES(?);", [newTodoTitle], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, newTodoTitle: newTodoTitle });
    console.log(this.lastID, newTodoTitle);
  });
});
app.put("/todos/:id", (req, res) => {
  const { id } = req.params;
  const { todoTitle } = req.body;
  db.run(
    "update tasks set title=? where id=?;",
    [todoTitle, id],
    function (error) {
      if (error) {
        return res.status(500).josn({ error: error.message });
      }
      res.json({ id, todoTitle });
    }
  );
});
module.exports = db;
