import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import { ApiResponse } from "../../utils/apiResponse";
import { validatePasswordResetToken } from "../../utils/generator";
import { updateUserPassword } from "../../db_ops/writers/auth_writer";

const prisma = new PrismaClient();

interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}
/**
 * @swagger
 * /api/auth/reset-password:
 *   patch:
 *     summary: Reset password
 *     tags: [Authentication Controller]
 *     description: Reset password for a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - token    
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or token expired  
 *       500:
 *         description: Internal server error
 */
export async function ResetPassword(req: Request, res: Response) {
    try {
        const { token, newPassword }: ResetPasswordRequest = req.body;

        const isValidToken = await validatePasswordResetToken(token);

        if (!isValidToken) {
            const errorResponse: ApiResponse = {
                success: false,
                status: 400,
                message: "Invalid token or token expired",
                payload: [],
            };
            return res.status(400).json(errorResponse);
        }

        await prisma.$transaction(async (tx) => {
            await updateUserPassword(isValidToken, newPassword, tx);
        }); 

        // Success response
        const successResponse: ApiResponse = {
            success: true,
            status: 200,
            message: "Password reset successfully",
            payload: [],
        };
        return res.status(200).json(successResponse);
    } catch (error) {
        console.error("Error in ResetPassword:", error);
        const errorResponse: ApiResponse = {
            success: false,
            status: 500,
            message: "Internal server error",
            payload: [],
        };
        return res.status(500).json(errorResponse);
    }
}