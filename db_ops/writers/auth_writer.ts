import { PrismaClient, Prisma } from "../../generated/prisma";
import { CreatedUserEventSchema } from "../../interface/auth_interface";
import { CreatedUserResponse } from "../../response/auth_response";
import { hashPassword } from "../../utils/passwordUtils";
const prisma = new PrismaClient();

interface UserResponse {
  success: boolean;
  status: number;
  message: string;
  data?: any;
  error?: string;
}

export async function createUser(
  payload: CreatedUserEventSchema, 
  password: string,
  tx?: Prisma.TransactionClient
): Promise<any> {
  try {
    // Hash the password before saving
    const hashedPassword = await hashPassword(password);

    const client = tx || prisma;
    
    // Create user with only User model fields
    const user = await client.user.create({
      data: {
        email: payload.email,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Create user profile with profile fields
    await client.userProfile.create({
      data: {
        userId: user.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.phoneNumber,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        zipCode: payload.zipCode,
        country: payload.country,
      },
    });

    // Create wallet for user
    await client.wallet.create({
      data: {
        userId: user.id,
        balance: 0,
        currency: "USD",
      },
    });
    const userResponse:CreatedUserResponse = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
    return userResponse;
  } catch (error) {
    console.error(error);
    throw error; // Let the controller handle the error
  }
}

export async function updateUserPassword(userId: string, newPassword: string, tx?: Prisma.TransactionClient) {
    try {
  const client = tx || prisma;
  const hashedPassword = await hashPassword(newPassword);
  await client.user.update({
    where: { id: userId },
      data: {
          password: hashedPassword,
          updatedAt: new Date(),
      },
  });
    
    // delete password reset token
    await client.passwordResetToken.deleteMany({
            where: { userId: userId },
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}