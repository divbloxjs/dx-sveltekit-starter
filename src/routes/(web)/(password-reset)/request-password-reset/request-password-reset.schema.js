import { z } from "zod";

export const requestPasswordResetSchema = z.object({
    email_address: z.coerce.string().trim().email().max(150)
});
