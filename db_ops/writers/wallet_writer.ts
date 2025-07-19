import { Prisma, PrismaClient, TransactionType } from "../../generated/prisma";
import { saveEventToDB } from "./event_writer";
const prisma = new PrismaClient();

interface FundWalletRequest {
    userId: string;
    amount: Prisma.Decimal;
}


interface WithdrawWalletRequest {
    userId: string;
    amount: Prisma.Decimal;
    currency: string;
}

interface TransactionRequest {
    userId: string;
    recipientWalletAddress: string;
    amount: Prisma.Decimal;
    currency: string;
    transactionType: string;
    transactionStatus: string;
}

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

// Fund wallet
async function fundWallet(event: FundWalletRequest, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const wallet = await client.wallet.findFirst({
        where: { userId: event.userId }
    });
    if (!wallet) {
        throw new Error("Wallet not found");
    }

    const eventPayload = {
        userId: event.userId,
        actionType: "FUND_WALLET_EVENT",
        actionName: "POST /api/v1/wallet/fund",
        payload: event
    }

    try {
        const eventResult = await saveEventToDB(eventPayload, tx);
        if (!eventResult) {
            throw new Error("Failed to save event");
        }
    } catch (error) {
        console.error(error);
        throw new Error("Failed to save event");
    }
    
    const transaction = await client.transaction.create({
        data: {
            id: "",
            walletId: wallet.id,
            amount: event.amount,
            description: "Fund wallet",
            userId: event.userId,
            transactionType: "DEPOSIT",
            status: "SUCCESS"
        }
    });
    wallet.balance = wallet.balance.plus(event.amount);
    await client.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance }
    });
    return transaction;
}

// Withdraw from wallet
async function withdrawWallet(event: WithdrawWalletRequest, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    const wallet = await client.wallet.findFirst({
        where: { userId: event.userId }
    });
    if (!wallet) {
        throw new Error("Wallet not found");
    }
    if (wallet.balance.lessThan(event.amount)) {
        throw new Error("Insufficient balance");
    }

    const eventPayload = {
        userId: event.userId,
        actionType: "WITHDRAW_WALLET_EVENT",
        actionName: "POST /api/v1/wallet/withdraw",
        payload: event
    }

    try {
        const eventResult = await saveEventToDB(eventPayload, tx);  
        if (!eventResult) {
            throw new Error("Failed to save event");
        }
    } catch (error) {
        console.error(error);
        throw new Error("Failed to save event");
    }

    const transaction = await client.transaction.create({
        data: {
            id: "",
            walletId: wallet.id,
            amount: event.amount,
            description: "Withdraw wallet",
            userId: event.userId,
            transactionType: "WITHDRAWAL",
            status: "SUCCESS"
        }
    });
    wallet.balance = wallet.balance.minus(event.amount);
    await client.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance }
    });
    return transaction;
}

async function transferWallet(event: TransactionRequest, tx?: Prisma.TransactionClient) {

    const client = tx || prisma;
    const wallet = await client.wallet.findFirst({
        where: { userId: event.userId }
    });
    if (!wallet) {
        throw new Error("Wallet not found");
    }
    if (wallet.balance.lessThan(event.amount)) {
        throw new Error("Insufficient balance");
    }

    const recipientWallet = await client.wallet.findFirst({
        where: { walletAddress: event.recipientWalletAddress }
    });
    if (!recipientWallet) {
        throw new Error("Recipient wallet not found");
    }

    const eventPayload = {
        userId: event.userId,
        actionType: "TRANSFER_WALLET_EVENT",
        actionName: "POST /api/v1/wallet/transfer",
        payload: event
    }
    
    try {
        const eventResult = await saveEventToDB(eventPayload, tx);
        if (!eventResult) {
            throw new Error("Failed to save event");
        }
    } catch (error) {
        console.error(error);
        throw new Error("Failed to save event");
    }

    const transaction = await client.transaction.create({
        data: {
            id: "",
            walletId: wallet.id,
            amount: event.amount,
            description: "Transfer wallet",
            userId: event.userId,
            transactionType: "TRANSFER",
            status: "SUCCESS"
        }
    });
    wallet.balance = wallet.balance.minus(event.amount);
    await client.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance }
    });
    return transaction;
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

export { fundWallet, withdrawWallet, transferWallet, getWalletBalance, getWalletTransactions };