import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import requirementRoutes from "./routes/requirementRoutes";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));

app.disable("x-powered-by");
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Calltime API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/requirements", requirementRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "This origin is not allowed to access the API.",
    });
  }

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  console.error("Unhandled API error:", error.message);

  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
});

export default app;
