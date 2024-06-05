import { z } from "zod";

export const requestPasswordResetSchema = z.object({
    emailAddress: z.coerce.string().trim().email().max(150)
});
