import { z } from "zod";

export const registerSchema = z
    .object({
        // DX-NOTE: Refer to the userAccount entity - username is by default set to emailAddress here
        emailAddress: z.string().email().max(150),
        password: z.string().min(8, "Requires at least 8 characters"),
        confirmPassword: z.string().min(8, { message: "Requires at least 8 characters" })
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"] // Path of error
    });
