import { z } from "zod";

export const fundingEventCreateSchema = z.object({
    description: z.string().trim().min(1, "Required"),
	amount: z.number().min(1, "Required"),
	type: z.string().trim().min(1, "Required"),
	issued_shares: z.number().min(1, "Required"),
	allocated_shares: z.number().min(1, "Required"),
	has_shares_issued_affect: z.boolean().optional().nullable(),
	funding_date: z.string().trim().min(1, "Required"),
	vesting_date: z.string().trim().min(1, "Required"),
	fund_id: z.string().trim().optional().nullable(),
	user_account_id: z.string().trim().optional().nullable()
});

export const fundingEventUpdateSchema = z.object({
    id: z.number().min(1, "Required"),
    description: z.string().trim().min(1, "Required"),
	amount: z.number().min(1, "Required"),
	type: z.string().trim().min(1, "Required"),
	issued_shares: z.number().min(1, "Required"),
	allocated_shares: z.number().min(1, "Required"),
	has_shares_issued_affect: z.boolean().optional().nullable(),
	funding_date: z.string().trim().min(1, "Required"),
	vesting_date: z.string().trim().min(1, "Required"),
	fund_id: z.string().trim().optional().nullable(),
	user_account_id: z.string().trim().optional().nullable()
});
