import { Request, Response } from "express";
import { createUser } from "../../db_ops/writers/auth_writer";
import { PrismaClient } from "../../generated/prisma";
import { saveEventToDB } from "../../db_ops/writers/event_writer";

const prisma = new PrismaClient();

interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ApiResponse {
  success: boolean;
  status: number;
  message: string;
  data?: any;
  payload?: any;
}

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication Controller]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: User already exists
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
async function RegisterUser(req: Request, res: Response) {
  try {
    // Validate request body
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      country,
    }: RegisterUserRequest = req.body;
      
    if (password.length < 8) {
      const errorResponse: ApiResponse = {
        success: false,
        status: 400,
        message: "Password must be at least 8 characters long",
        payload: [],
      };
      return res.status(400).json(errorResponse);
    }
    
    if (!email.includes("@")) {
      const errorResponse: ApiResponse = {
        success: false,
        status: 400,
        message: "Invalid email address",
        payload: [],
      };
      return res.status(400).json(errorResponse);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const errorResponse: ApiResponse = {
        success: false,
        status: 409,
        message: "User already exists",
        payload: [],
      };
      return res.status(409).json(errorResponse);
    }

    // Create user event data
    const createdUserEvent = {
      id: "", 
      email,
      firstName,
      lastName,
      phoneNumber,
      address,
      city,
      state,
      zipCode,
      country,
      createdAt: new Date(),
    };

    // Use transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
          
        // Save event to database with proper user ID
         await saveEventToDB({
            userId: "",
            actionType: "POST",
            actionName: "createdUserEvent",
            payload: createdUserEvent,
         }, tx);
          
      // Create user first
      const user = await createUser(createdUserEvent, password, tx);

      return user;
    });
    
    return res.status(201).json(
        {
            success: true,
            status: 201,
            message: "User created successfully",
            payload: result,
        }
    );
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      status: 500,
      message: "Internal server error",
      payload: [],
    };
    res.status(500).json(errorResponse);
  }
}

export { RegisterUser };