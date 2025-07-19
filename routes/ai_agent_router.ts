import { Router } from "express";
import { getFinancialInsightsCtrl, createSmartBudgetCtrl, predictExpensesCtrl } from "../controllers/ai_agent_ctrl/aiAgentCtrl";
import { setupAutomationCtrl, executeAutomationCtrl, setupSmartSavingsCtrl } from "../controllers/ai_agent_ctrl/automationCtrl";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Apply authentication middleware to all AI agent routes
router.use(authenticateToken);

// AI-powered financial insights
router.get("/financial-insights", getFinancialInsightsCtrl);

// AI-powered smart budget creation
router.post("/smart-budget", createSmartBudgetCtrl);

// AI-powered expense prediction
router.get("/expense-predictor", predictExpensesCtrl);

// AI automation endpoints
router.post("/automation/setup", setupAutomationCtrl);
router.post("/automation/execute", executeAutomationCtrl);
router.post("/automation/smart-savings", setupSmartSavingsCtrl);

export default router; 