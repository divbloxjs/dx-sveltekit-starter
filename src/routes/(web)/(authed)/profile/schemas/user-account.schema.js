import { z } from "zod";

export const userAccountSchema = z.object({
    id: z.coerce.string().max(150).nullable(),
    first_name: z.string().max(150).nullable(),
    last_name: z.string().max(150).nullable(),
    email_address: z.string().email().max(150)
});
