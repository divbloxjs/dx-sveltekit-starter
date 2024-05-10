import { z } from "zod";

export const registerSchema = z
    .object({
        // firstName: z.string().min(2).max(50),
        // lastName: z.string().min(2).max(50),
        emailAddress: z.string().email().max(150),
        password: z.string().min(8),
        confirmPassword: z.string().min(8)
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirm"] // path of error
    });

export const initialData = {
    // firstName: "First Name",
    // lastName: "Last Name",
    emailAddress: "dani.simeonov@gmail.com",
    password: "12345678",
    confirmPassword: "12345678"
};

export type RegisterSchema = typeof registerSchema;
