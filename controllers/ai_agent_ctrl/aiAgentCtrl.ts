import { Request, Response } from "express";
import { ApiResponse } from "../../utils/apiResponse";
import { PrismaClient } from "../../generated/prisma";
import { saveEventToDB } from "../../db_ops/writers/event_writer";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/v1/ai-agent/financial-insights:
 *   get:
 *     summary: Get AI-powered financial insights
 *     description: Get intelligent insights about user's financial patterns and recommendations
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial insights generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
async function getFinancialInsightsCtrl(req: Request, res: Response) {
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

        // Get user's transaction history
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Get wallet balance
        const wallet = await prisma.wallet.findFirst({
            where: { userId }
        });

        // AI Analysis - Spending Patterns
        const spendingByType = transactions.reduce((acc, transaction) => {
            if (transaction.transactionType === 'WITHDRAWAL') {
                acc[transaction.description || 'Other'] = (acc[transaction.description || 'Other'] || 0) + Number(transaction.amount);
            }
            return acc;
        }, {} as Record<string, number>);

        // AI Analysis - Income Patterns
        const incomeBySource = transactions.reduce((acc, transaction) => {
            if (transaction.transactionType === 'DEPOSIT') {
                acc[transaction.description || 'Other'] = (acc[transaction.description || 'Other'] || 0) + Number(transaction.amount);
            }
            return acc;
        }, {} as Record<string, number>);

        // Generate AI Insights
        const insights = {
            spendingPatterns: {
                topCategories: Object.entries(spendingByType)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, amount]) => ({ category, amount })),
                totalSpent: Object.values(spendingByType).reduce((sum, amount) => sum + amount, 0)
            },
            incomePatterns: {
                topSources: Object.entries(incomeBySource)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([source, amount]) => ({ source, amount })),
                totalIncome: Object.values(incomeBySource).reduce((sum, amount) => sum + amount, 0)
            },
            recommendations: generateRecommendations(spendingByType, incomeBySource, wallet?.balance || 0),
            currentBalance: wallet?.balance || 0,
            currency: wallet?.currency || 'USD'
        };

        // Save AI analysis event
        await saveEventToDB({
            userId,
            actionType: "GET",
            actionName: "aiFinancialInsights",
            payload: { insightsGenerated: true, transactionCount: transactions.length }
        });

        const response: ApiResponse = {
            success: true,
            status: 200,
            message: "Financial insights generated successfully",
            payload: insights
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
 * /api/v1/ai-agent/smart-budget:
 *   post:
 *     summary: Create AI-powered smart budget
 *     description: Generate intelligent budget recommendations based on spending patterns
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monthlyIncome:
 *                 type: number
 *                 description: Expected monthly income
 *               savingsGoal:
 *                 type: number
 *                 description: Monthly savings goal
 *     responses:
 *       200:
 *         description: Smart budget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
async function createSmartBudgetCtrl(req: Request, res: Response) {
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

        const { monthlyIncome, savingsGoal } = req.body;

        // Get historical spending data
        const transactions = await prisma.transaction.findMany({
            where: { 
                userId,
                transactionType: 'WITHDRAWAL',
                createdAt: {
                    gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
                }
            }
        });

        // AI Budget Analysis
        const spendingByCategory = transactions.reduce((acc, transaction) => {
            const category = transaction.description || 'Other';
            acc[category] = (acc[category] || 0) + Number(transaction.amount);
            return acc;
        }, {} as Record<string, number>);

        const totalSpent = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);
        const averageMonthlySpending = totalSpent / 3; // 90 days = 3 months

        // Generate AI Budget Recommendations
        const budget = {
            monthlyIncome: monthlyIncome || 0,
            savingsGoal: savingsGoal || 0,
            recommendedBudget: {
                essentials: Math.round(averageMonthlySpending * 0.5), // 50% for essentials
                discretionary: Math.round(averageMonthlySpending * 0.3), // 30% for discretionary
                savings: Math.round(averageMonthlySpending * 0.2), // 20% for savings
                emergency: Math.round(monthlyIncome * 0.1) // 10% emergency fund
            },
            categoryBreakdown: Object.entries(spendingByCategory)
                .map(([category, amount]) => ({
                    category,
                    currentSpending: amount / 3, // Average monthly
                    recommendedLimit: Math.round((amount / 3) * 0.8) // 20% reduction
                }))
                .sort((a, b) => b.currentSpending - a.currentSpending),
            aiRecommendations: generateBudgetRecommendations(spendingByCategory, monthlyIncome, savingsGoal)
        };

        // Save budget creation event
        await saveEventToDB({
            userId,
            actionType: "POST",
            actionName: "aiSmartBudget",
            payload: { budgetCreated: true, monthlyIncome, savingsGoal }
        });

        const response: ApiResponse = {
            success: true,
            status: 200,
            message: "Smart budget created successfully",
            payload: budget
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
 * /api/v1/ai-agent/expense-predictor:
 *   get:
 *     summary: Predict future expenses
 *     description: Use AI to predict upcoming expenses based on historical patterns
 *     tags: [AI Agent]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expense predictions generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
async function predictExpensesCtrl(req: Request, res: Response) {
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

        // Get historical transaction data
        const transactions = await prisma.transaction.findMany({
            where: { 
                userId,
                transactionType: 'WITHDRAWAL'
            },
            orderBy: { createdAt: 'desc' }
        });

        // AI Pattern Analysis
        const monthlyPatterns = analyzeMonthlyPatterns(transactions);
        const weeklyPatterns = analyzeWeeklyPatterns(transactions);
        const categoryPredictions = predictCategoryExpenses(transactions);

        const predictions = {
            nextMonthPrediction: {
                totalExpected: monthlyPatterns.averageMonthlySpending,
                categoryBreakdown: categoryPredictions,
                confidence: calculateConfidence(transactions.length)
            },
            nextWeekPrediction: {
                totalExpected: weeklyPatterns.averageWeeklySpending,
                dayBreakdown: weeklyPatterns.dayBreakdown,
                confidence: calculateConfidence(transactions.length)
            },
            seasonalTrends: analyzeSeasonalTrends(transactions),
            recommendations: generateExpenseRecommendations(monthlyPatterns, categoryPredictions)
        };

        // Save prediction event
        await saveEventToDB({
            userId,
            actionType: "GET",
            actionName: "aiExpensePrediction",
            payload: { predictionsGenerated: true, dataPoints: transactions.length }
        });

        const response: ApiResponse = {
            success: true,
            status: 200,
            message: "Expense predictions generated successfully",
            payload: predictions
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

// Helper functions for AI analysis
function generateRecommendations(spending: Record<string, number>, income: Record<string, number>, balance: number) {
    const totalSpending = Object.values(spending).reduce((sum, amount) => sum + amount, 0);
    const totalIncome = Object.values(income).reduce((sum, amount) => sum + amount, 0);
    
    const recommendations = [];
    
    if (totalSpending > totalIncome * 0.9) {
        recommendations.push("Consider reducing discretionary spending to maintain financial health");
    }
    
    if (balance < totalIncome * 0.1) {
        recommendations.push("Build emergency fund by saving at least 10% of income");
    }
    
    const topSpendingCategory = Object.entries(spending).sort(([,a], [,b]) => b - a)[0];
    if (topSpendingCategory) {
        recommendations.push(`Focus on reducing ${topSpendingCategory[0]} expenses - highest spending category`);
    }
    
    return recommendations;
}

function generateBudgetRecommendations(spending: Record<string, number>, income: number, savingsGoal: number) {
    const recommendations = [];
    const totalSpending = Object.values(spending).reduce((sum, amount) => sum + amount, 0);
    
    if (totalSpending > income * 0.8) {
        recommendations.push("Current spending is high relative to income. Consider the 50/30/20 rule.");
    }
    
    if (savingsGoal > income * 0.3) {
        recommendations.push("Savings goal is ambitious. Start with 20% and gradually increase.");
    }
    
    return recommendations;
}

function analyzeMonthlyPatterns(transactions: any[]) {
    const monthlyTotals: Record<string, number> = {};
    
    transactions.forEach(transaction => {
        const month = transaction.createdAt.toISOString().slice(0, 7); // YYYY-MM
        monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(transaction.amount);
    });
    
    const monthlyAmounts = Object.values(monthlyTotals);
    const averageMonthlySpending = monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length;
    
    return { averageMonthlySpending, monthlyTotals };
}

function analyzeWeeklyPatterns(transactions: any[]) {
    const dayTotals: Record<string, number> = {};
    
    transactions.forEach(transaction => {
        const day = transaction.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
        dayTotals[day] = (dayTotals[day] || 0) + Number(transaction.amount);
    });
    
    const weeklyAmounts = Object.values(dayTotals);
    const averageWeeklySpending = weeklyAmounts.reduce((sum, amount) => sum + amount, 0);
    
    return { averageWeeklySpending, dayBreakdown: dayTotals };
}

function predictCategoryExpenses(transactions: any[]) {
    const categoryTotals: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    
    transactions.forEach(transaction => {
        const category = transaction.description || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.amount);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    return Object.entries(categoryTotals).map(([category, total]) => ({
        category,
        averagePerTransaction: total / categoryCounts[category],
        predictedNextMonth: (total / categoryCounts[category]) * (categoryCounts[category] / 3) // Assuming 3 months of data
    }));
}

function analyzeSeasonalTrends(transactions: any[]) {
    const seasonalData: Record<string, number> = {};
    
    transactions.forEach(transaction => {
        const month = transaction.createdAt.getMonth();
        const season = month < 3 ? 'Winter' : month < 6 ? 'Spring' : month < 9 ? 'Summer' : 'Fall';
        seasonalData[season] = (seasonalData[season] || 0) + Number(transaction.amount);
    });
    
    return seasonalData;
}

function calculateConfidence(dataPoints: number) {
    // Simple confidence calculation based on data points
    if (dataPoints > 100) return 0.95;
    if (dataPoints > 50) return 0.85;
    if (dataPoints > 20) return 0.75;
    if (dataPoints > 10) return 0.65;
    return 0.5;
}

function generateExpenseRecommendations(monthlyPatterns: any, categoryPredictions: any[]) {
    const recommendations = [];
    
    if (monthlyPatterns.averageMonthlySpending > 0) {
        recommendations.push("Based on your spending patterns, consider setting up automatic savings transfers");
    }
    
    const highSpendingCategories = categoryPredictions
        .filter(cat => cat.predictedNextMonth > monthlyPatterns.averageMonthlySpending * 0.2)
        .map(cat => cat.category);
    
    if (highSpendingCategories.length > 0) {
        recommendations.push(`Monitor spending in: ${highSpendingCategories.join(', ')}`);
    }
    
    return recommendations;
}

export { getFinancialInsightsCtrl, createSmartBudgetCtrl, predictExpensesCtrl }; 