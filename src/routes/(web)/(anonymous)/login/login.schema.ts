import { z } from "zod";

export const loginSchema = z.object({
    email_address: z.string().email().max(150),
    password: z.string().min(1, { message: "Required" })
    // termsAccepted: z.boolean()
    // termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the terms & conditions" }) }),
    // type: z.enum(["", "Deposit", "Withdrawal", "Allocated"]),
    // date: z.coerce.date({ errorMap: () => ({ message: "Required" }) }).nullable(),
    // date: z.coerce.date().nullable()
});

export type LoginSchema = typeof loginSchema;
