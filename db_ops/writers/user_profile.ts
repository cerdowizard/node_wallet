import { Prisma, PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

interface UpdateUserProfileRequest {
    userId: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
} 
interface UserWallet{
    id: string;
    userId: string;
    walletAddress: string | null;
    createdAt: Date;
    updatedAt: Date;
}

interface GetUserProfileRequest {
    userId: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    country: string | null;
    wallet: UserWallet | null;
    createdAt: Date;
    updatedAt: Date;
}


    async function updateUserProfile(event: UpdateUserProfileRequest, tx?: Prisma.TransactionClient) : Promise<any> {
    try {
        const { userId, firstName, lastName, phoneNumber, address, city, state, zipCode, country } = event;
        const client = tx || prisma;
        const userProfile = await client.userProfile.update({
            where: { userId },
            data: {
                firstName,
                lastName,
                phoneNumber,
                address,
                city,
                state,
                zipCode,
                country,
                updatedAt: new Date()
            }
        });
        return userProfile;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getUserProfile(userId: string, tx?: Prisma.TransactionClient) : Promise<any> {
    const client = tx || prisma;
    const userProfile = await client.userProfile.findUnique({
        where: { userId }
    });
    if (!userProfile) {
        throw new Error("User profile not found");
    }
    const wallet: UserWallet | null = await client.wallet.findFirst({
        where: { userId: userProfile.userId }
    });
    const userProfileResponse: GetUserProfileRequest = {
        userId: userProfile.userId,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phoneNumber: userProfile.phoneNumber,
        address: userProfile.address,
        city: userProfile.city,
        state: userProfile.state,
        zipCode: userProfile.zipCode,
        country: userProfile.country,
        wallet: wallet || null,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt
    };
    return userProfileResponse;
}

export { updateUserProfile, UpdateUserProfileRequest, getUserProfile };