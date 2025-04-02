import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const rolesArray = ["admin", "user"];
type Role = typeof rolesArray[number];

export function roleMiddleware(allowedRoles: Role[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole || !rolesArray.includes(userRole)) {
            res.status(401).json({ message: 'User role not found' });
            return;
        }

        if (!userRole || !allowedRoles.includes(userRole)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        next();
    };
}