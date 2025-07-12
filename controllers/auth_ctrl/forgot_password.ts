import { Request, Response } from "express";
import { PrismaClient } from "../../generated/prisma";
import { ApiResponse } from "../../utils/apiResponse";
import { generatePasswordResetToken } from "../../utils/generator";
import { saveEventToDB } from "../../db_ops/writers/event_writer";


const prisma = new PrismaClient();

interface ForgotPasswordRequest {
    email: string;
}

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Authentication Controller]
 *     requestBody: 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *     responses:
 *       200:
 *         description: Password reset email sent
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Email is required
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
 *       500:
 *         description: Internal server error
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'   
 */

export async function ForgotPassword(req: Request, res: Response) {
    try {
    const { email } = req.body;

    //vailidate email
    if (!email) {
        const errorResponse: ApiResponse = {
            success: false,
            status: 400,
            message: "Email is required",
            payload: [],
        };
    }

    // check if user exists
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        const errorResponse: ApiResponse = {
            success: false,
            status: 404,
            message: "User not found",
            payload: [],
        };
    }
    const result = await prisma.$transaction(async (tx) => {
    saveEventToDB({
        userId: user?.id || "",
        actionType: "POST",
        actionName: "forgotPassword",
        payload: {
            email,
            },
        }, tx);
        const token = await generatePasswordResetToken(user?.id || "");
        return token;
    });
    const successResponse: ApiResponse = {
        success: true,
        status: 200,
        message: "Password reset email sent",
        payload: [],
    };
        return res.status(200).json(successResponse);
    } catch (error) {
        console.error("Error in ForgotPassword:", error);
        const errorResponse: ApiResponse = {
            success: false,
            status: 500,
            message: "Internal server error",
            payload: [],
        };
        return res.status(500).json(errorResponse);
    }
}