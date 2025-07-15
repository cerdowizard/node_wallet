import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { PrismaClient } from "../../generated/prisma";
import { verifyPassword } from "../../utils/passwordUtils";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwtUtils";

const prisma = new PrismaClient();

interface LoginUserRequest {
    email: string;
    password: string;
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication Controller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
export async function LoginUser(req: Request, res: Response) {
    try {
        const { email, password }: LoginUserRequest = req.body;

        // Validate input
        if (!email || !password) {
            const errorResponse: ApiResponse = {
                success: false,
                status: 400,
                message: "Email and password are required",
                payload: [],
            };
            return res.status(400).json(errorResponse);
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                profile: true,
                wallets: true,
            },
        });

        if (!user) {
            const errorResponse: ApiResponse = {
                success: false,
                status: 404,
                message: "User not found",
                payload: [],
            };
            return res.status(404).json(errorResponse);
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            const errorResponse: ApiResponse = {
                success: false,
                status: 401,
                message: "Invalid credentials",
                payload: [],
            };
            return res.status(401).json(errorResponse);
        }

        // Generate JWT tokens
        const accessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            userId: user.id,
            tokenVersion: 1, // You can increment this to invalidate all tokens
        });

        // Success response
        const successResponse: ApiResponse = {
            success: true,
            status: 200,
            message: "Login successful",
            payload: {
                id: user.id,
                email: user.email,
                firstName: user.profile?.firstName,
                lastName: user.profile?.lastName,
                wallets: user.wallets,
                accessToken,
                refreshToken,
            },
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        console.error("Login error:", error);
        const errorResponse: ApiResponse = {
            success: false,
            status: 500,
            message: "Internal server error",
            payload: [],
        };
        return res.status(500).json(errorResponse);
    }
}


