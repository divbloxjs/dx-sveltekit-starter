import { z } from "zod";

export const loginSchema = z.object({
    email_address: z.string().email().max(150),
    password: z.string().min(1, { message: "Required" })
    // termsAccepted: z.boolean()
    // termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the terms & conditions" }) }).default(false),
    // type: z.enum(["", "Deposit", "Withdrawal", "Allocated"]),
    // type: z.enum(["Deposit", "Withdrawal", "Allocated"]).default(""),
    // type: z.enum(["Deposit", "Withdrawal", "Allocated"], { errorMap: () => ({ message: "Required" }) }).default(""),
    // date: z.coerce.date({ errorMap: () => ({ message: "Required" }) }).nullable(),
    // date: z.coerce.date().nullable()
    // age: z.number({ message: "Required" }).min(0, "You can't be so young...").default(null),
    // issued_shares: z.number({ message: "Required" }).default(null),
    // relationship: z.number().min(1, "Required").nullable(),
});

export type LoginSchema = typeof loginSchema;
