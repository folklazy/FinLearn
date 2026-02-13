import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name?: string;
            };
        }
    }
}

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

/**
 * Auth middleware — verifies NextAuth JWT token
 * Token is sent as: Authorization: Bearer <token>
 * Or from NextAuth session cookie
 */
export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;

        if (!token) {
            res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
            return;
        }

        if (!NEXTAUTH_SECRET) {
            console.error('NEXTAUTH_SECRET is not configured');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }

        const secret = new TextEncoder().encode(NEXTAUTH_SECRET);
        const { payload } = await jwtVerify(token, secret);

        req.user = {
            id: payload.id as string,
            email: payload.email as string,
            name: payload.name as string | undefined,
        };

        next();
    } catch (error) {
        console.error('Auth verification failed:', error);
        res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
        return;
    }
}

/**
 * Optional auth — attaches user if token exists, continues either way
 */
export async function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.slice(7)
            : null;

        if (token && NEXTAUTH_SECRET) {
            const secret = new TextEncoder().encode(NEXTAUTH_SECRET);
            const { payload } = await jwtVerify(token, secret);

            req.user = {
                id: payload.id as string,
                email: payload.email as string,
                name: payload.name as string | undefined,
            };
        }
    } catch {
        // Token invalid — continue without user
    }

    next();
}
