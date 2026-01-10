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
  { method: "POST", path: "/customers/register" },
  { method: "POST", path: "/partners/register" },
  { method: "GET", path: "/events" },
];

app.use(async (req, res, next) => {
  const isUnprotectedRoute = unprotectedPaths.some(
    (route) => route.method === req.method && route.path.startsWith(req.path)
  );

  if (isUnprotectedRoute) {
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
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    const passwordMatch = bcrypt.compareSync(password, user?.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user?.id, email: user?.email },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: "Database connection error" });
  } finally {
    await connection.end();
  }
});

app.post("/partners/register", async (req, res) => {
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

    res.status(201).json({
      id: partnerResult.insertId,
      name,
      user_id: userId,
      company_name,
      created_at: createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create partner" });
  } finally {
    await connection.end();
  }
});

app.post("/customers/register", async (req, res) => {
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

    res.status(201).json({
      id: partnerResult.insertId,
      name,
      user_id: userId,
      address,
      phone,
      created_at: createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create partner" });
  } finally {
    await connection.end();
  }
});

app.post("/partners/events", async (req, res) => {
  const { name, description, date, location } = req.body;

  const userId = req.user!.id;

  const connection = await createConnection();

  try {
    const [partnerRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );

    const partner = partnerRows.length > 0 ? partnerRows[0] : null;

    if (!partner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const eventDate = new Date(date);
    const createdAt = new Date();

    const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO events (partner_id, name, description, date, location, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [partner.id, name, description, eventDate, location, createdAt]
    );

    res.status(201).json({
      id: eventResult.insertId,
      partner_id: partner.id,
      name,
      description,
      date: eventDate,
      location,
      created_at: createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  } finally {
    await connection.end();
  }
});

app.get("/partners/events", async (req, res) => {
  const userId = req.user!.id;

  const connection = await createConnection();

  try {
    const [partnerRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );

    const partner = partnerRows.length > 0 ? partnerRows[0] : null;

    if (!partner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE partner_id = ?",
      [partner.id]
    );

    res.status(200).json(eventRows);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  } finally {
    await connection.end();
  }
});

app.get("/partners/events/:eventId", async (req, res) => {
  const { eventId } = req.params;

  const userId = req.user!.id;

  const connection = await createConnection();

  try {
    const [partnerRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );

    const partner = partnerRows.length > 0 ? partnerRows[0] : null;

    if (!partner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE id = ? AND partner_id = ?",
      [eventId, partner.id]
    );

    const event = eventRows.length > 0 ? eventRows[0] : null;

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(eventRows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve event" });
  } finally {
    await connection.end();
  }
});

app.post("/events", async (req, res) => {
  const { name, description, date, location } = req.body;

  const connection = await createConnection();

  try {
    const eventDate = new Date(date);
    const createdAt = new Date();

    const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO events (name, description, date, location, created_at) VALUES (?, ?, ?, ?, ?)",
      [name, description, eventDate, location, createdAt]
    );

    res.status(201).json({
      id: eventResult.insertId,
      name,
      description,
      date: eventDate,
      location,
      created_at: createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  } finally {
    await connection.end();
  }
});

app.get("/events", async (req, res) => {
  const connection = await createConnection();

  try {
    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events"
    );

    res.status(200).json(eventRows);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  } finally {
    await connection.end();
  }
});

app.get("/events/:eventId", async (req, res) => {
  const { eventId } = req.params;

  const connection = await createConnection();

  try {
    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );

    const event = eventRows.length > 0 ? eventRows[0] : null;

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to create event" });
  } finally {
    await connection.end();
  }
});

const PORT = process.env.PORT || 3000;

export default app;

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
