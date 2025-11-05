export type MarketingAgentInput = {
  product_id: string;
  user_id: string;
  product_name: string;
  product_file_s3_url: string;
  landing_url: string;
  niche: string;
  max_images: number;
  variants_per_platform: number;
  human_review_required: boolean;
};

export type PlatformVariant = {
  caption: string;
  angle: string;
  callToAction: string;
  hashtags: string[];
  hook: string;
  keywords: string[];
  imagePrompt: string;
  recommendedPostingTime: string;
};

export type PlatformAssets = {
  platform:
    | "twitter"
    | "pinterest"
    | "instagram"
    | "linkedin"
    | "reddit";
  variants: PlatformVariant[];
  strategyNotes: string;
};

export type ResearchInsight = {
  title: string;
  insight: string;
  action: string;
};

export type MarketingAgentOutput = {
  product_id: string;
  status: "success" | "partial" | "failed";
  master_assets_s3: string | null;
  research_insights_s3: string | null;
  assets: PlatformAssets[];
  research_insights: ResearchInsight[];
  summary: string;
  review_recommendation: string | null;
};
