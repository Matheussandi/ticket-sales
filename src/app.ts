import express from "express";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createConnection } from "./database.ts";

import { authRouter } from "./controller/auth-controller.ts";
import { partnerRouter } from "./controller/partner-controller.ts";
import { customerRouter } from "./controller/customer-controller.ts";
import { eventsRouter } from "./controller/events-controller.ts";
import { UserService } from "./services/user-service.ts";

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
    
    const userService = new UserService();
    const user = await userService.findById(payload.id);

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

app.use("/auth", authRouter);
app.use("/customers", customerRouter);
app.use("/partners", partnerRouter);
app.use("/events", eventsRouter);

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
