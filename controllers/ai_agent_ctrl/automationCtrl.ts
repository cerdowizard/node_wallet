import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { PrismaClient } from "../../generated/prisma";
import { saveEventToDB } from "../../db_ops/writers/event_writer";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/ai-agent/automation/setup:
 *   post:
 *     summary: Setup AI automation rules
 *     description: Configure intelligent automation rules for financial management
 *     tags: [AI Automation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               automationType:
 *                 type: string
 *                 enum: [SPENDING_LIMIT, SAVINGS_GOAL, BILL_REMINDER, INVESTMENT_ALERT]
 *               threshold:
 *                 type: number
 *               action:
 *                 type: string
 *                 enum: [NOTIFY, BLOCK, TRANSFER, INVEST]
 *               category:
 *                 type: string
 *                 description: Spending category to monitor
 *     responses:
 *       200:
 *         description: Automation rule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
async function setupAutomationCtrl(req: Request, res: Response) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                status: 401,
                message: "User not authenticated",
                payload: null
            };
            return res.status(401).json(response);
        }

        const { automationType, threshold, action, category } = req.body;

        // Validate automation parameters
        if (!automationType || !threshold || !action) {
            const response: ApiResponse = {
                success: false,
                status: 400,
                message: "Missing required automation parameters",
                payload: null
            };
            return res.status(400).json(response);
        }

        // Create automation rule
        const automationRule = {
            userId,
            type: automationType,
            threshold: threshold,
            action: action,
            category: category || 'ALL',
            isActive: true,
            createdAt: new Date()
        };

        // Save automation event
        await saveEventToDB({
            userId,
            actionType: "POST",
            actionName: "aiAutomationSetup",
            payload: automationRule
        });

        const response: ApiResponse = {
            success: true,
            status: 200,
            message: "Automation rule created successfully",
            payload: {
                rule: automationRule,
                description: generateAutomationDescription(automationType, threshold, action, category)
            }
        };

        return res.status(200).json(response);

    } catch (error) {
        const response: ApiResponse = {
            success: false,
            status: 500,
            message: "Internal server error",
            payload: error
        };
        return res.status(500).json(response);
    }
}

/**
 * @swagger
 * /api/v1/ai-agent/automation/execute:
 *   post:
 *     summary: Execute automation actions
 *     description: Trigger automation actions based on current financial state
 *     tags: [AI Automation]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Automation executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
async function executeAutomationCtrl(req: Request, res: Response) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                status: 401,
                message: "User not authenticated",
                payload: null
            };
            return res.status(401).json(response);
        }

        // Get user's current financial state
        const wallet = await prisma.wallet.findFirst({
            where: { userId }
        });

        const recentTransactions = await prisma.transaction.findMany({
            where: { 
                userId,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            }
        });

        // Execute AI automation logic
        const automationResults = await executeAutomationLogic(userId, wallet, recentTransactions);

        // Save automation execution event
        await saveEventToDB({
            userId,
            actionType: "POST",
            actionName: "aiAutomationExecute",
            payload: { 
                executed: true, 
                actionsTaken: automationResults.length,
                balance: wallet?.balance || 0
            }
        });

        const response: ApiResponse = {
            success: true,
            status: 200,
            message: "Automation executed successfully",
            payload: {
                actions: automationResults,
                summary: {
                    totalActions: automationResults.length,
                    balance: wallet?.balance || 0,
                    lastUpdated: new Date()
                }
            }
        };

        return res.status(200).json(response);

    } catch (error) {
        const response: ApiResponse = {
            success: false,
            status: 500,
            message: "Internal server error",
            payload: error
        };
        return res.status(500).json(response);
    }
}

/**
 * @swagger
 * /api/v1/ai-agent/automation/smart-savings:
 *   post:
 *     summary: Setup smart savings automation
 *     description: Configure intelligent savings automation based on spending patterns
 *     tags: [AI Automation]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetAmount:
 *                 type: number
 *                 description: Target savings amount
 *               timeframe:
 *                 type: string
 *                 enum: [WEEKLY, MONTHLY, QUARTERLY]
 *               strategy:
 *                 type: string
 *                 enum: [AGGRESSIVE, MODERATE, CONSERVATIVE]
 *     responses:
 *       200:
 *         description: Smart savings automation configured successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
async function setupSmartSavingsCtrl(req: Request, res: Response) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            const response: ApiResponse = {
                success: false,
                status: 401,
                message: "User not authenticated",
                payload: null
            };
            return res.status(401).json(response);
        }

        const { targetAmount, timeframe, strategy } = req.body;

        // Get user's spending patterns
        const transactions = await prisma.transaction.findMany({
            where: { 
                userId,
                transactionType: 'WITHDRAWAL',
                createdAt: {
                    gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
                }
            }
        });

        // Calculate optimal savings strategy
        const totalSpending = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const averageMonthlySpending = totalSpending / 3;

        const savingsPlan = calculateSavingsPlan(targetAmount, timeframe, strategy, averageMonthlySpending);

        // Save smart savings configuration
        await saveEventToDB({
            userId,
            actionType: "POST",
            actionName: "aiSmartSavings",
            payload: { 
                targetAmount, 
                timeframe, 
                strategy, 
                savingsPlan 
            }
        });

        const response: ApiResponse = {
            success: true,
            status: 200,
            message: "Smart savings automation configured successfully",
            payload: {
                targetAmount,
                timeframe,
                strategy,
                savingsPlan,
                recommendations: generateSavingsRecommendations(savingsPlan, averageMonthlySpending)
            }
        };

        return res.status(200).json(response);

    } catch (error) {
        const response: ApiResponse = {
            success: false,
            status: 500,
            message: "Internal server error",
            payload: error
        };
        return res.status(500).json(response);
    }
}

// Helper functions for automation
function generateAutomationDescription(type: string, threshold: number, action: string, category: string) {
    const descriptions = {
        SPENDING_LIMIT: `Alert when spending exceeds $${threshold} in ${category}`,
        SAVINGS_GOAL: `Automatically transfer $${threshold} when balance allows`,
        BILL_REMINDER: `Remind about upcoming bills over $${threshold}`,
        INVESTMENT_ALERT: `Suggest investment when balance exceeds $${threshold}`
    };
    
    return descriptions[type as keyof typeof descriptions] || "Custom automation rule";
}

async function executeAutomationLogic(userId: string, wallet: any, transactions: any[]) {
    const actions = [];
    const balance = Number(wallet?.balance || 0);
    
    // Check for low balance alert
    if (balance < 100) {
        actions.push({
            type: "LOW_BALANCE_ALERT",
            message: "Your balance is low. Consider reducing spending or adding funds.",
            priority: "HIGH",
            timestamp: new Date()
        });
    }
    
    // Check for unusual spending patterns
    const recentSpending = transactions
        .filter(t => t.transactionType === 'WITHDRAWAL')
        .reduce((sum, t) => sum + Number(t.amount), 0);
    
    if (recentSpending > balance * 0.8) {
        actions.push({
            type: "HIGH_SPENDING_ALERT",
            message: "Recent spending is high relative to your balance.",
            priority: "MEDIUM",
            timestamp: new Date()
        });
    }
    
    // Check for savings opportunity
    if (balance > 1000 && recentSpending < balance * 0.3) {
        actions.push({
            type: "SAVINGS_OPPORTUNITY",
            message: "Great opportunity to save! Consider transferring to savings.",
            priority: "LOW",
            timestamp: new Date()
        });
    }
    
    return actions;
}

function calculateSavingsPlan(targetAmount: number, timeframe: string, strategy: string, monthlySpending: number) {
    const timeframes = {
        WEEKLY: 52,
        MONTHLY: 12,
        QUARTERLY: 4
    };
    
    const periods = timeframes[timeframe as keyof typeof timeframes] || 12;
    const baseAmount = targetAmount / periods;
    
    const strategies = {
        AGGRESSIVE: 1.5,
        MODERATE: 1.0,
        CONSERVATIVE: 0.7
    };
    
    const multiplier = strategies[strategy as keyof typeof strategies] || 1.0;
    const adjustedAmount = baseAmount * multiplier;
    
    return {
        baseAmount: Math.round(baseAmount * 100) / 100,
        adjustedAmount: Math.round(adjustedAmount * 100) / 100,
        totalPeriods: periods,
        strategy: strategy,
        estimatedCompletion: new Date(Date.now() + periods * 7 * 24 * 60 * 60 * 1000)
    };
}

function generateSavingsRecommendations(savingsPlan: any, monthlySpending: number) {
    const recommendations = [];
    
    if (savingsPlan.adjustedAmount > monthlySpending * 0.3) {
        recommendations.push("Consider a more conservative strategy to maintain lifestyle");
    }
    
    if (savingsPlan.adjustedAmount < monthlySpending * 0.1) {
        recommendations.push("You can afford a more aggressive savings strategy");
    }
    
    recommendations.push(`Set up automatic transfers of $${savingsPlan.adjustedAmount} per ${savingsPlan.strategy.toLowerCase()} period`);
    
    return recommendations;
}

export { setupAutomationCtrl, executeAutomationCtrl, setupSmartSavingsCtrl }; 