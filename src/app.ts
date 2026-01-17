import express from "express";
import jwt from "jsonwebtoken";

import { customerRouter } from "./controller/customer-controller.ts";
import { partnerRouter } from "./controller/partner-controller.ts";
import { eventsRouter } from "./controller/events-controller.ts";
import { authRouter } from "./controller/auth-controller.ts";

import { UserService } from "./services/user-service.ts";

import { Database } from "./database.ts";
import { ticketRoutes } from "./controller/ticket-contoller.ts";

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
    (route) => route.method === req.method && req.path.startsWith(route.path)
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
app.use("/events", ticketRoutes);

const PORT = process.env.PORT || 3000;

export default app;

app.listen(PORT, async () => {
  const connection = Database.getInstance();

  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE tickets");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log(`Server is running on port ${PORT}`);
});

// MVC - Model-View-Controller (Architecture)

// Application Service - o que quero expor como regras de negócio da aplicação
// Domain Service - regras de negócio específicas de um domínio
// Active Record - padrão onde o modelo de dados é responsável por persistir a si mesmo