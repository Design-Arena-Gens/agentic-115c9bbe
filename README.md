# AI Organic Marketing Agent

Generate platform-ready organic marketing assets, captions, and image prompts for digital products using a single input payload.

## Overview

This Next.js application ingests structured product metadata, a downloadable product asset, and a landing-page URL to output optimized organic marketing packages for Twitter (X), Pinterest, Instagram, LinkedIn, and Reddit. Each package contains:

- Ready-to-copy multi-variant captions tuned per platform
- Hooks, CTAs, hashtags, keyword focus, and recommended posting times
- Visual prompts to hand off to image-generation systems
- Research insights summarizing landing-page positioning and recommended actions
- Download links (data-URI) for master assets and research insight JSON files

## Tech Stack

- Next.js 14 (App Router)
- React 18 with client-side UI
- TypeScript + strict schema validation via Zod
- Cheerio for lightweight landing-page scraping

## Getting Started

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## API Usage

Send a `POST` request to `/api/generate` with the following JSON body:

```json
{
  "product_id": "uuid",
  "user_id": "uuid",
  "product_name": "Launch OS",
  "product_file_s3_url": "https://example.com/product.pdf",
  "landing_url": "https://example.com",
  "niche": "creator-led product launches",
  "max_images": 5,
  "variants_per_platform": 3,
  "human_review_required": true
}
```

The response includes platform asset packages, research insights, summary, and data-URI download links for generated JSON bundles.

## UI Flow

- Paste or edit the JSON payload in the editor.
- Click **Generate Assets** to fetch the API.
- Review platform-specific variants, research insights, and download the compiled files.

## Notes

- Asset download links are encoded `data:` URLs, making them instantly copyable or savable without external storage.
- When the product file cannot be automatically parsed, the system flags the run as `partial` to signal the need for manual review.
- Landing-page crawling is best-effort and gracefully degrades when external sites block automated requests.

## License

MIT
