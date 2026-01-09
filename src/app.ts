import express from "express";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

const unprotectedPaths = [
  { method: "POST", path: "/auth/login" },
  { method: "POST", path: "/customers" },
  { method: "POST", path: "/partners" },
  { method: "GET", path: "/events" },
];

app.use(async (req, res, next) => {
  const isUnprotected = unprotectedPaths.some(
    (route) => route.method === req.method && route.path.startsWith(req.path)
  );

  if (isUnprotected) {
    return next();
  }

  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.json({ error: "No token provided" });
  }

  try {
    const payload = jwt.verify(token, "your_secret_key") as {
      id: number;
      email: string;
    };
    const connection = await createConnection();
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [payload.id]
    );

    const user = rows.length > 0 ? rows[0] : null;

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user as { id: number; email: string };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const connection = await createConnection();

  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    const user = rows[0];

    const passwordMatch = bcrypt.compareSync(password, user?.password);
    if (!passwordMatch) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user?.id, email: user?.email },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).send({ error: "Database connection error" });
  } finally {
    await connection.end();
  }
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

    res.status(201).send({
      id: partnerResult.insertId,
      name,
      user_id: userId,
      company_name,
      created_at: createdAt,
    });
  } catch (error) {
    console.error("Error creating partner:", error);
    res.status(500).send({ error: "Failed to create partner" });
  } finally {
    await connection.end();
  }
});

app.post("/customers", async (req, res) => {
  const { name, email, password, address, phone } = req.body;

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
      "INSERT INTO customers (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)",
      [userId, address, phone, createdAt]
    );

    res.status(201).send({
      id: partnerResult.insertId,
      name,
      user_id: userId,
      address,
      phone,
      created_at: createdAt,
    });
  } catch (error) {
    console.error("Error creating partner:", error);
    res.status(500).send({ error: "Failed to create partner" });
  } finally {
    await connection.end();
  }
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
