import { updateUserProfile, UpdateUserProfileRequest, getUserProfile } from "../../db_ops/writers/user_profile";
import { ApiResponse } from "../../utils/apiResponse";
import { Request, Response } from "express";

/**
 * @swagger
 *  /api/v1/user/update:
 *   patch:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number
 *               address:
 *                 type: string
 *                 description: User's address
 *               city:
 *                 type: string
 *                 description: User's city
 *               state:
 *                 type: string
 *                 description: User's state
 *               zipCode:
 *                 type: string
 *                 description: User's zip code
 *               country:
 *                 type: string
 *                 description: User's country
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
async function updateUserProfileCtrl(req: Request, res: Response) {
    try {
        // Get userId from authenticated user (set by authMiddleware)
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

        const { firstName, lastName, phoneNumber, address, city, state, zipCode, country } = req.body;

        const userProfile = await updateUserProfile({ userId, firstName, lastName, phoneNumber, address, city, state, zipCode, country });

        const response: ApiResponse = {
            success: true,
            status: 200,
            message: "User profile updated successfully",
            payload: userProfile
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
 * /api/v1/user/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Get the authenticated user's profile information
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'   
 */ 
async function getCurrentUserProfileCtrl(req: Request, res: Response) {
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

        const userProfile = await getUserProfile(userId);
        const response: ApiResponse = {
            success: true,
            status: 200,
            message: "User profile fetched successfully",
            payload: userProfile
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

export { updateUserProfileCtrl, getCurrentUserProfileCtrl };