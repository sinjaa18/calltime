import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Calltime API running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} received. Shutting down gracefully...`);

      server.close(() => {
        void mongoose.disconnect().finally(() => process.exit(0));
      });
    };

    process.once("SIGINT", () => shutdown("SIGINT"));
    process.once("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error(
      "Failed to start server:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

void startServer();
