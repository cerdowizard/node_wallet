import { Prisma, PrismaClient, TransactionType } from "../../generated/prisma";
import { saveEventToDB } from "../writers/event_writer";
const prisma = new PrismaClient();


interface GetWalletBalanceRequest {
    userId: string;
}

interface GetWalletTransactionHistoryRequest {
    userId: string;
    walletId: string;
    amount: Prisma.Decimal;
    transactionType: TransactionType;
    transactionStatus: string;
    createdAt: Date;
    updatedAt: Date;
}


// Get wallet balance
async function getWalletBalance(event: GetWalletBalanceRequest, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const wallet = await client.wallet.findFirst({
        where: { userId: event.userId }
    });
    if (!wallet) {
        throw new Error("Wallet not found");
    }
    return wallet.balance;
}

// Get wallet transactions
async function getWalletTransactions(event: GetWalletTransactionHistoryRequest, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const transactions = await client.transaction.findMany({
        where: {
            userId: event.userId,
            walletId: event.walletId,
            amount: event.amount,
            transactionType: event.transactionType,
            status: event.transactionStatus,
            createdAt: event.createdAt,
            updatedAt: event.updatedAt
        }
    });
    return transactions;
}
// Get wallet transaction history

// Get wallet transaction details
