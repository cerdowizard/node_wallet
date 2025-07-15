import express, { Request, Response } from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import s3Client from "../../utils/s3Config";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

export const uploadFile = upload.single("file");


/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file to S3
 *     tags: [Upload Controller]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:  
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 url:
 *                   type: string
 *                   description: The URL of the uploaded file
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Error uploading file
 */

export const uploadFileController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const file = req.file;
    const bucketName = process.env.AWS_BUCKET_NAME!;
    const fileKey = `${crypto.randomUUID()}-${file.originalname}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    res.status(200).json({ message: "File uploaded successfully", url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Error uploading file");
  }
};
