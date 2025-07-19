import express, { Request, Response, NextFunction } from "express";
import authRouter from "./routes/auth_router";
import uploadRouter from "./routes/upload_router";
import userProfileRouter from "./routes/user_profile_router";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { specs } from "./config/swagger";
import walletRouter from "./routes/wallet";
const app = express();

// CORS configuration
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/user", userProfileRouter);
app.use("/api/v1/wallet", walletRouter);


/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check server health
 *     tags: [Health Checker]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});