import { Router } from "express";
import { 
    fundWalletCtrl, 
    withdrawWalletCtrl, 
    transferWalletCtrl, 
    getWalletBalanceCtrl, 
    getWalletTransactionsCtrl 
} from "../controllers/wallet_ctrl/walletCtrl";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Apply authentication to all wallet routes
router.use(authenticateToken);

// Wallet operations
router.post("/fund", fundWalletCtrl);
router.post("/withdraw", withdrawWalletCtrl);
router.post("/transfer", transferWalletCtrl);
router.get("/balance", getWalletBalanceCtrl);
router.get("/transactions", getWalletTransactionsCtrl);

export default router;