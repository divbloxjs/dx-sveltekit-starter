import { z } from "zod";

export const organisationCreateSchema = z.object({
    org_name: z.string().trim().min(1, "Required"),
	org_date: z.string().trim().min(1, "Required"),
	org_date_time: z.string().trim().min(1, "Required"),
	org_number: z.number().min(1, "Required"),
	org_json: z.string().trim().min(1, "Required"),
	status: z.string().trim().min(1, "Required"),
	parent_organisation_id: z.string().trim().nullable(),
});

export const organisationUpdateSchema = z.object({
    id: z.coerce.string(),
    org_name: z.string().trim().min(1, "Required"),
	org_date: z.string().trim().min(1, "Required"),
	org_date_time: z.string().trim().min(1, "Required"),
	org_number: z.number().min(1, "Required"),
	org_json: z.string().trim().min(1, "Required"),
	status: z.string().trim().min(1, "Required"),
	parent_organisation_id: z.string().trim().nullable(),
});
