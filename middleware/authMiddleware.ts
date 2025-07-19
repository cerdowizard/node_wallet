import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwtUtils';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      status: 401,
      message: 'Access token required',
      payload: null,
    });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      status: 403,
      message: 'Invalid or expired token',
      payload: null,
    });
  }

  // Add user info to request
  req.user = decoded;
  next();
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        status: 401,
        message: 'Authentication required',
        payload: null,
      });
    }

    if (req.user.role !== role && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        status: 403,
        message: 'Insufficient permissions',
        payload: null,
      });
    }

    next();
  };
} 


