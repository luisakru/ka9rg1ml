import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/utils";

export function loggerMiddleware(req: Request, _res: Response, next: NextFunction) {
    const reqBody = {
        method: req.method,
        path: req.path,
        body: req.body,
    }
    logger.info(`${req.method} ${req.path}`, { reqBody })
    next();
}