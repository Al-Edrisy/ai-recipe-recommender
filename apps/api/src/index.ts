import express, { Express, RequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.routes";
import recipeRoutes from "./routes/recipe.routes"; 
import logger from "./middlewares/logger";
import errorHandler from "./middlewares/errorHandler";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from 'compression';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter as RequestHandler);

// Compression
app.use(compression() as RequestHandler);

// Logging
app.use(logger);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes); 

// Health check
app.get("/health", (_, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString() 
  });
});

// Error handling
app.use(errorHandler);

// Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

export default app;