import { z } from "zod";

export const marketingAgentInputSchema = z.object({
  product_id: z.string().uuid(),
  user_id: z.string().uuid(),
  product_name: z.string().min(2),
  product_file_s3_url: z.string().url(),
  landing_url: z.string().url(),
  niche: z.string().min(2),
  max_images: z.number().int().min(0).max(12).default(5),
  variants_per_platform: z.number().int().min(1).max(10).default(3),
  human_review_required: z.boolean().default(true)
});

export type MarketingAgentInputSchema = z.infer<
  typeof marketingAgentInputSchema
>;
