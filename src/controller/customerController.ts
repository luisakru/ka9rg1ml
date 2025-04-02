import { NextFunction, Request, Response } from "express";
import { CustomerRequestBody, customerRequestBodySchema } from "../validators/customerValidator";
import { logger } from "../utils/utils";
import { ZodError } from "zod";
import { HttpError } from "../types/HttpError";
import { createCustomer, fetchCustomer, modifyCustomer } from "../services/customerService";


export const postCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validCustomer: CustomerRequestBody = await customerRequestBodySchema.parseAsync(req.body);

        const createdCustomer = await createCustomer(validCustomer);

        res.status(201).json(createdCustomer);
    } catch (error) {
        if (error instanceof ZodError) {
            logger.error({ message: 'Invalid body', error });
            next(new HttpError('Invalid body', 400));
        }
        next(error);
    }
};

export const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = await fetchCustomer(req.params.email)

        res.status(200).json(customer);
    } catch (error) {
        next(error);
    }
};

export const putCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validCustomer: Partial<CustomerRequestBody> = await customerRequestBodySchema.partial().parseAsync(req.body);

        await modifyCustomer(req.params.email, validCustomer);

        res.status(200).send();
    } catch (error) {
        if (error instanceof ZodError) {
            logger.error({ message: 'Invalid body', error });
            next(new HttpError('Invalid body', 400))
        }
        next(error);
    }
};