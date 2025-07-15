import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { PrismaClient } from "../../generated/prisma";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "../../utils/jwtUtils";

const prisma = new PrismaClient();

interface RefreshTokenRequest {
    refreshToken: string;
}

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication Controller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
export async function refreshToken(req: Request, res: Response) {
    try {
        const { refreshToken }: RefreshTokenRequest = req.body;

        if (!refreshToken) {
            const errorResponse: ApiResponse = {
                success: false,
                status: 400,
                message: "Refresh token is required",
                payload: null,
            };
            return res.status(400).json(errorResponse);
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            const errorResponse: ApiResponse = {
                success: false,
                status: 401,
                message: "Invalid refresh token",
                payload: null,
            };
            return res.status(401).json(errorResponse);
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            const errorResponse: ApiResponse = {
                success: false,
                status: 404,
                message: "User not found",
                payload: null,
            };
            return res.status(404).json(errorResponse);
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const newRefreshToken = generateRefreshToken({
            userId: user.id,
            tokenVersion: decoded.tokenVersion,
        });

        // Success response
        const successResponse: ApiResponse = {
            success: true,
            status: 200,
            message: "Token refreshed successfully",
            payload: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        };

        return res.status(200).json(successResponse);
    } catch (error) {
        console.error("Refresh token error:", error);
        const errorResponse: ApiResponse = {
            success: false,
            status: 500,
            message: "Internal server error",
            payload: null,
        };
        return res.status(500).json(errorResponse);
    }
} 