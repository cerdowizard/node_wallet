import { PrismaClient } from "../generated/prisma";
import crypto from "crypto";
const prisma = new PrismaClient();

export async function generatePasswordResetToken(userId: string) { 
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    try {
        const existingToken = await prisma.passwordResetToken.findFirst({
            where: {
                userId: userId,
            },
        });
        if (existingToken) {
            await prisma.passwordResetToken.deleteMany({
                where: {
                    id: existingToken.id,
                },
            });
        }
    await prisma.passwordResetToken.create({
        data: {
            userId,
            token,
            expiresAt,
        },
        }); 
        return token;  
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function validatePasswordResetToken(token: string): Promise<string | null> {
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
        where: {
            token: token,
        },
    });
    if (!passwordResetToken) {
        return null;
    }
    if (passwordResetToken.expiresAt < new Date()) {
        return null;
    }
    return passwordResetToken.userId;
}