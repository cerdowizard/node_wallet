import { PrismaClient, Prisma } from "../../generated/prisma";
import { EventSchema } from "../../interface/eventInterface";

const prisma = new PrismaClient();

export async function saveEventToDB(
  payload: Omit<EventSchema, 'id'>, 
  tx?: Prisma.TransactionClient
): Promise<boolean> {
    try {
        const client = tx || prisma;
        await client.event.create({
            data: {
                userId: payload.userId,
                actionType: payload.actionType,
                actionName: payload.actionName,
                payload: payload.payload,
            },
        });
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}