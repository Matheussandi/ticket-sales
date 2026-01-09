import express from "express";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";

function createConnection() {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "tickets",
    port: 3306,
  });
}

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  res.send("Login attempt logged");
});

app.post("/partners", async (req, res) => {
  const { name, email, password, company_name } = req.body;

  const connection = await createConnection();

  try {
    const createdAt = new Date();
    const hashedPassword = bcrypt.hashSync(password, 10);

    const [userResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, createdAt]
    );

    const userId = userResult.insertId;

    const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO partners (user_id, company_name, created_at) VALUES (?, ?, ?)",
      [userId, company_name, createdAt]
    );

    res
      .status(201)
      .send({ id: partnerResult.insertId, user_id: userId, company_name, created_at: createdAt });
  } catch (error) {
    console.error("Error creating partner:", error);
    res.status(500).send({ error: "Failed to create partner" });
  } finally {
    await connection.end();
  }
});

app.post("/customers", (req, res) => {
  const { name, email, password, address, phone } = req.body;
  res.send("Customer registration logged");
});

app.post("/partners/events", (req, res) => {
  const { name, description, date, location } = req.body;
  res.send("Event creation logged");
});

app.get("/partners/events", (req, res) => {});

app.get("/partners/events/:eventId", (req, res) => {
  const { eventId } = req.params;
  console.log(`Event ID requested: ${eventId}`);
  res.send("Event details logged");
});

app.post("/events", (req, res) => {
  const { name, description, date, location } = req.body;
  res.send("Event creation logged");
});

app.get("/events", (req, res) => {});

app.get("/events/:eventId", (req, res) => {
  const { eventId } = req.params;
  console.log(`Event ID requested: ${eventId}`);
  res.send("Event details logged");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  const connection = await createConnection();

  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

  // await connection.end();

  console.log(`Server is running on port ${PORT}`);
});
