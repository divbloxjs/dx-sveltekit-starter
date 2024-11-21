import { z } from "zod";

export const loginSchema = z.object({
    email_address: z.string().email().max(150),
    password: z.string().min(1, { message: "Required" })
    // termsAccepted: z.boolean()
    // termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the terms & conditions" }) })
});

export type LoginSchema = typeof loginSchema;
