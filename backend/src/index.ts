import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

import { tablesRouter } from "./tables/router.js";
import { inventoryRouter } from "./inventory/router.js";
import { reportsRouter } from "./reports/router.js";
import { createOrdersRouter } from "./orders/router.js";
import { menuRouter } from "./menu/router.js";
import { authRouter } from "./auth/router.js";

const app = express();
const server = http.createServer(app);

const corsOrigins = (process.env.CORS_ORIGIN ?? "").split(",").filter(Boolean);

const io = new SocketIOServer(server, {
  cors: { origin: corsOrigins },
});

app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/tables", tablesRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/menu-items", menuRouter);
app.use("/api/orders", createOrdersRouter(io));

// TODO: /api/suppliers — leveranciers en bestellingen (src/suppliers)
// TODO: /api/spotify — OAuth-flow, playlist, zoeken (src/spotify)
// TODO: printing-service die luistert op "order:new" en de keukenbon print (src/printing)

io.on("connection", (socket) => {
  console.log(`Client verbonden: ${socket.id}`);
});

const port = Number(process.env.PORT ?? 3001);
server.listen(port, () => {
  console.log(`ResPOS backend draait op http://localhost:${port}`);
});
