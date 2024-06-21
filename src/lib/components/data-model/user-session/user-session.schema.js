import { z } from "zod";

export const userSessionCreateSchema = z.object({
    expires_at: z.string().trim().min(1, "Required"),
	session_id: z.string().trim().min(1, "Required"),
	user_agent: z.string().trim().min(1, "Required"),
	session_data: z.string().trim().min(1, "Required"),
	duration_in_minutes: z.number().min(1, "Required"),
	user_account_id: z.string().trim().nullable(),
});

export const userSessionUpdateSchema = z.object({
    id: z.coerce.string(),
    expires_at: z.string().trim().min(1, "Required"),
	session_id: z.string().trim().min(1, "Required"),
	user_agent: z.string().trim().min(1, "Required"),
	session_data: z.string().trim().min(1, "Required"),
	duration_in_minutes: z.number().min(1, "Required"),
	user_account_id: z.string().trim().nullable(),
});
