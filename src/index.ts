import express from "express";
import { connectDatabase } from "./database/mongodb";
import authRoutes from "./routes/auth.route";
import eventRoutes from "./routes/event.route";
import { PORT } from "./config";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Evently"
    });
});

async function startServer() {
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
