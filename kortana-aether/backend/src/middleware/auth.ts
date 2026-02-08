import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        address: string;
        role: string;
    };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer TOKEN

        const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_not_for_prod';

        jwt.verify(token, jwtSecret, (err: any, user: any) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }

            req.user = user as { address: string; role: string };
            next();
        });
    } else {
        res.status(401).json({ message: 'Authorization header missing' });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
