import { z } from "zod";

export const customerRequestBodySchema = z.object({
    email: z.string().email("Invalid email format").min(1, "Email is required"),
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    phone: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    website: z.string().optional().nullable(),
    lifecyclestage: z.string().optional().nullable(),
});

export type CustomerRequestBody = z.infer<typeof customerRequestBodySchema>;
