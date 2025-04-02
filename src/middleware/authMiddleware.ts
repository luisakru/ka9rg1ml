import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Access denied" })
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string; role: string };
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error });
    }
}