import { NextFunction, Request, Response } from "express";
import { SECRET_KEY } from "../config";
import jwt from "jsonwebtoken";


const generateToken = (user: { id: string; role: string }) => {
    return jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });
};

export const createToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Here could be some login logic
        const token = generateToken({ id: "123", role: req.params.role });
        res.status(200).json(token);
    } catch (error) {
        next(error);
    }
};