import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/utils";
import { HttpError } from "../types/HttpError";

export function errorMiddleware(error: Error | HttpError, req: Request, res: Response, _next: NextFunction) {
    logger.error({
        message: error.message,
        requestData: { method: req.method, url: req.url, body: req.body },
    });

    if (error.stack) delete error.stack;

    const status = error instanceof HttpError ? error.statusCode : 500;
    res.status(status).send({ message: error.message });
}