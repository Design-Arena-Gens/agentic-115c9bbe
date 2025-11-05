import * as cheerio from "cheerio";
import {
  MarketingAgentInput,
  MarketingAgentOutput,
  PlatformAssets,
  PlatformVariant,
  ResearchInsight
} from "./types";

type LandingPageSummary = {
  title: string;
  description: string;
  headlines: string[];
  keywords: string[];
  valueProps: string[];
};

const PLATFORM_CONFIG: Record<
  PlatformAssets["platform"],
  { defaultCTA: string; bestTimes: string[]; tone: string }
> = {
  twitter: {
    defaultCTA: "Tap to explore the product now",
    bestTimes: ["8:00 AM", "12:30 PM", "5:30 PM"],
    tone: "bold + punchy"
  },
  pinterest: {
    defaultCTA: "Pin it for your next project",
    bestTimes: ["9:00 AM", "3:00 PM", "8:00 PM"],
    tone: "visual + aspirational"
  },
  instagram: {
    defaultCTA: "Swipe through & click the link in bio",
    bestTimes: ["11:00 AM", "1:00 PM", "7:00 PM"],
    tone: "story-first + emotive"
  },
  linkedin: {
    defaultCTA: "Request access or learn more",
    bestTimes: ["8:30 AM", "10:00 AM", "2:00 PM"],
    tone: "insightful + data-backed"
  },
  reddit: {
    defaultCTA: "Check out the full breakdown here",
    bestTimes: ["10:00 AM", "1:00 PM", "9:00 PM"],
    tone: "authentic + community-first"
  }
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

async function fetchLandingPageSummary(
  landingUrl: string
): Promise<LandingPageSummary> {
  try {
    const res = await fetch(landingUrl, { next: { revalidate: 60 } });
    if (!res.ok) {
      throw new Error(`Landing page fetch failed with ${res.status}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $("title").first().text().trim() || "Digital Product";
    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $("p").first().text().trim() ||
      "";
    const headlines = $("h1, h2")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .slice(0, 6);
    const keywordCandidates = $('meta[name="keywords"]')
      .attr("content")
      ?.split(",")
      .map((kw) => kw.trim()) ?? [];
    const valueProps = $("li")
      .slice(0, 8)
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

    return {
      title,
      description,
      headlines,
      keywords: keywordCandidates,
      valueProps
    };
  } catch (error) {
    console.error("Landing page summary failed:", error);
    return {
      title: "Digital Product",
      description: "",
      headlines: [],
      keywords: [],
      valueProps: []
    };
  }
}

async function extractProductFileHighlights(url: string): Promise<string[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Product file fetch failed with ${res.status}`);
    }
    const contentType = res.headers.get("content-type") ?? "";

    if (contentType.includes("text/plain")) {
      const text = await res.text();
      return text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 12);
    }

    if (contentType.includes("application/json")) {
      const json = await res.json();
      return [
        "Includes structured JSON data with actionable insights.",
        `Top-level keys: ${Object.keys(json).slice(0, 6).join(", ")}`
      ];
    }

    if (contentType.includes("application/pdf")) {
      return [
        "Detailed PDF guide included.",
        "Highlight key frameworks, checklists, and visuals when promoting."
      ];
    }

    if (contentType.includes("zip")) {
      return [
        "Downloadable bundle with multiple assets.",
        "Emphasize templates, resources, and quick-start guides in messaging."
      ];
    }

    return [
      "Rich downloadable asset included.",
      "Focus on the most transformative outcomes and quick wins."
    ];
  } catch (error) {
    console.error("Product file extraction failed:", error);
    return [
      "Unable to automatically read the product file.",
      "Highlight the most compelling value proposition manually."
    ];
  }
}

const selectRecommendedTime = (platform: PlatformAssets["platform"], index: number) => {
  const slots = PLATFORM_CONFIG[platform].bestTimes;
  return slots[index % slots.length];
};

const generateHook = (
  platform: PlatformAssets["platform"],
  niche: string,
  productName: string,
  highlight: string,
  variantIndex: number
) => {
  const baseHooks = [
    `What if ${niche} pros had ${productName} on day one?`,
    `The ${productName} shortcut top ${niche} creators keep quiet.`,
    `${productName}: turn your ${niche} ideas into revenue-ready assets.`,
    `I tried ${productName} so you don't have to... here’s the verdict.`,
    `${highlight} — delivered in minutes with ${productName}.`
  ];
  return baseHooks[(variantIndex + hashString(highlight)) % baseHooks.length];
};

const generateHashtags = (
  niche: string,
  platform: PlatformAssets["platform"]
) => {
  const normalized = niche
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 3);

  const platformModifiers: Record<PlatformAssets["platform"], string[]> = {
    twitter: ["growth", "thread", "digitalproduct"],
    pinterest: ["pinspiration", "aesthetic", "designideas"],
    instagram: ["reels", "carouseltips", "creator"],
    linkedin: ["digitalstrategy", "professionaldevelopment", "productivity"],
    reddit: ["AMA", "caseStudy", "howto"]
  };

  const baseTags = normalized.map((word) => `#${word}`);
  const extraTags = platformModifiers[platform].map((word) => `#${word}`);
  return baseTags.concat(extraTags).slice(0, 5);
};

const generateImagePrompt = (
  platform: PlatformAssets["platform"],
  productName: string,
  niche: string,
  highlight: string,
  variantIndex: number
) => {
  const aesthetics: Record<PlatformAssets["platform"], string> = {
    twitter:
      "minimalist neon blueprint aesthetic, crisp infographic elements, dark navy background, futuristic sans-serif typography, 3D lighting, 16:9",
    pinterest:
      "warm minimal flat-lay, natural lighting, textured paper background, elegant serif typography, muted pastel palette, 2:3 vertical poster",
    instagram:
      "dynamic carousel cover, gradient glow, bold modern typography, high-contrast color pops, subtle grain, 1:1 square frame",
    linkedin:
      "sleek corporate deck cover, cool-toned palette, data visualization accents, refined sans-serif fonts, clean layout, 3:2 aspect ratio",
    reddit:
      "playful comic infographic, hand-drawn arrows, bold header text, community vibes, 4:5 portrait"
  };

  const vibe = aesthetics[platform];
  return `${vibe}. Feature headline "${highlight}" with ${productName} callout. Showcase ${niche} transformation. Variant ${variantIndex +
    1}.`;
};

const craftVariant = (
  platform: PlatformAssets["platform"],
  input: MarketingAgentInput,
  highlight: string,
  variantIndex: number,
  coreBenefits: string[]
): PlatformVariant => {
  const { product_name: productName, niche, landing_url: landingUrl } = input;
  const angleOptions = [
    `Outcome-focused for ${niche} creators`,
    `Behind-the-scenes breakdown of ${productName}`,
    `Step-by-step walkthrough leveraging ${productName}`,
    `Common ${niche} pain point solved instantly`,
    `Proof-driven angle showing before/after transformation`
  ];

  const primaryBenefit = coreBenefits[variantIndex % coreBenefits.length];
  const hook = generateHook(platform, niche, productName, highlight, variantIndex);
  const callToAction = `${PLATFORM_CONFIG[platform].defaultCTA} → ${landingUrl}`;

  const captionSections = [
    hook,
    `Why it matters: ${primaryBenefit}.`,
    `Inside you'll get: ${highlight}.`,
    `Built for ${niche} makers who want momentum fast.`,
    PLATFORM_CONFIG[platform].tone === "authentic + community-first"
      ? "Let's discuss what would make this even better below."
      : "Ready to launch something people can't ignore?"
  ];

  return {
    caption: captionSections.join("\n\n"),
    angle: angleOptions[(variantIndex + hashString(highlight)) % angleOptions.length],
    callToAction,
    hashtags: generateHashtags(niche, platform),
    hook,
    keywords: [productName, niche, primaryBenefit],
    imagePrompt: generateImagePrompt(platform, productName, niche, highlight, variantIndex),
    recommendedPostingTime: selectRecommendedTime(platform, variantIndex)
  };
};

const craftPlatformAssets = (
  platform: PlatformAssets["platform"],
  input: MarketingAgentInput,
  highlights: string[],
  coreBenefits: string[]
): PlatformAssets => {
  const usableHighlights = highlights.length
    ? highlights
    : [
        "Transform ideas into launch-ready assets",
        "Reduce production time dramatically",
        "Ready-made templates & frameworks included"
      ];

  const variants = Array.from({
    length: clamp(input.variants_per_platform, 1, 6)
  }).map((_, index) => {
    const highlight = usableHighlights[index % usableHighlights.length];
    return craftVariant(platform, input, highlight, index, coreBenefits);
  });

  const strategyNotes = [
    `Tone: ${PLATFORM_CONFIG[platform].tone}`,
    `Lead with proof-driven intro then tangible takeaway.`,
    `Use ${platform === "reddit" ? "discussion prompts" : "motion-first visuals"} for scroll-stop.`,
    `Repurpose into sequences by rotating hooks + CTA.`
  ].join(" ");

  return {
    platform,
    variants,
    strategyNotes
  };
};

const generateCoreBenefits = (
  input: MarketingAgentInput,
  landingSummary: LandingPageSummary,
  productHighlights: string[]
) => {
  const baseBenefits = [
    `${input.product_name} accelerates ${input.niche} outcomes.`,
    `Built to remove guesswork from ${input.niche} workflows.`,
    `Transforms downloaded content into revenue-generating assets.`,
    `Actionable frameworks curated for ${input.niche} operators.`,
    `Ships with copy-and-paste resources so you launch faster.`
  ];

  const headlineBenefits = landingSummary.headlines.slice(0, 3);
  const highlightBenefits = productHighlights.slice(0, 3);
  return [...headlineBenefits, ...highlightBenefits, ...baseBenefits]
    .map((item) => item.replace(/\.$/, ""))
    .filter(Boolean)
    .slice(0, 6);
};

const buildResearchInsights = (
  input: MarketingAgentInput,
  landingSummary: LandingPageSummary,
  highlights: string[]
): ResearchInsight[] => {
  const insights: ResearchInsight[] = [];

  const nicheInsight: ResearchInsight = {
    title: `${input.niche} Momentum`,
    insight: `Audiences in ${input.niche} respond strongly to frameworks plus tangible assets. Headlines referencing "${landingSummary.title}" carry extra weight.`,
    action:
      "Prioritize carousel or thread formats that break down the framework, followed by a clear CTA linking to the landing page."
  };
  insights.push(nicheInsight);

  if (landingSummary.description) {
    insights.push({
      title: "Landing Page Positioning",
      insight: `Primary promise: "${landingSummary.description}".`,
      action:
        "Mirror this promise verbatim in at least one paid angle and use it as the closing CTA for organic content."
    });
  }

  if (highlights.length) {
    insights.push({
      title: "Asset Highlights",
      insight: `Standout deliverables include ${highlights.slice(0, 2).join(" and ")}.`,
      action:
        "Convert each highlight into a short-form video storyboard or animated GIF to boost engagement on Instagram and Pinterest."
    });
  }

  insights.push({
    title: "Community Feedback Loop",
    insight:
      "Organic traction compounds when early adopters co-create. Encourage UGC by shipping a swipe file or challenge template.",
    action:
      "Add a post-purchase prompt asking customers to share their fastest win, then feature those quotes in LinkedIn and Reddit follow-ups."
  });

  return insights.slice(0, 4);
};

const createDataUrl = (data: unknown) => {
  const json = JSON.stringify(data, null, 2);
  const base64 = Buffer.from(json, "utf8").toString("base64");
  return `data:application/json;base64,${base64}`;
};

export async function generateMarketingResponse(
  input: MarketingAgentInput
): Promise<MarketingAgentOutput> {
  const [landingSummary, productHighlights] = await Promise.all([
    fetchLandingPageSummary(input.landing_url),
    extractProductFileHighlights(input.product_file_s3_url)
  ]);

  const coreBenefits = generateCoreBenefits(
    input,
    landingSummary,
    productHighlights
  );

  const platforms: PlatformAssets["platform"][] = [
    "twitter",
    "pinterest",
    "instagram",
    "linkedin",
    "reddit"
  ];

  const assets = platforms.map((platform) =>
    craftPlatformAssets(platform, input, productHighlights, coreBenefits)
  );

  const researchInsights = buildResearchInsights(
    input,
    landingSummary,
    productHighlights
  );

  const summaryLines = [
    `Generated ${assets.reduce(
      (count, asset) => count + asset.variants.length,
      0
    )} variants across ${assets.length} platforms.`,
    `Focus areas: ${coreBenefits.slice(0, 3).join(", ")}.`,
    input.human_review_required
      ? "Flagged for human polish before scheduling."
      : "Ready for direct publishing."
  ];

  const outputPayload: MarketingAgentOutput = {
    product_id: input.product_id,
    status: "success",
    master_assets_s3: null,
    research_insights_s3: null,
    assets,
    research_insights: researchInsights,
    summary: summaryLines.join(" "),
    review_recommendation: input.human_review_required
      ? "Run a final tone and compliance sweep before distribution."
      : null
  };

  outputPayload.master_assets_s3 = createDataUrl({
    generated_at: new Date().toISOString(),
    product_id: input.product_id,
    assets
  });

  outputPayload.research_insights_s3 = createDataUrl({
    generated_at: new Date().toISOString(),
    product_id: input.product_id,
    research_insights: researchInsights,
    landing_summary: landingSummary
  });

  if (productHighlights.includes("Unable to automatically read the product file.")) {
    outputPayload.status = "partial";
  }

  return outputPayload;
}
