"use client";

import { useMemo, useState } from "react";
import { MarketingAgentOutput } from "@/lib/types";
import styles from "./page.module.css";

const DEFAULT_SAMPLE = `{
  "product_id": "8b32531b-37ac-458f-9602-6fb0c421e2d1",
  "user_id": "4b85c53b-0328-4f0d-8f61-0f96164c77b9",
  "product_name": "Creator Launch OS",
  "product_file_s3_url": "https://raw.githubusercontent.com/vercel/next.js/canary/examples/data-fetching/data.txt",
  "landing_url": "https://vercel.com/templates/next.js",
  "niche": "creator-led product launches",
  "max_images": 5,
  "variants_per_platform": 3,
  "human_review_required": true
}`;

type GenerationState = "idle" | "loading" | "error" | "success";

export default function Home() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_SAMPLE);
  const [state, setState] = useState<GenerationState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MarketingAgentOutput | null>(null);

  const formattedJson = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(jsonInput), null, 2);
    } catch {
      return jsonInput;
    }
  }, [jsonInput]);

  const handleGenerate = async () => {
    setState("loading");
    setError(null);
    setResult(null);

    try {
      const parsed = JSON.parse(jsonInput);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Failed to generate assets");
      }

      const payload = (await response.json()) as MarketingAgentOutput;
      setResult(payload);
      setState("success");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Unknown error occurred.");
    }
  };

  const downloadJson = (title: string, content: unknown) => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:application/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(content, null, 2)
      )}`
    );
    element.setAttribute("download", `${title}.json`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>AI Organic Marketing Agent</h1>
          <p>
            Upload product context, link your landing page, and receive
            platform-ready copy + image prompts tuned for virality.
          </p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.primary}
            onClick={handleGenerate}
            disabled={state === "loading"}
          >
            {state === "loading" ? "Generating..." : "Generate Assets"}
          </button>
          <button
            className={styles.secondary}
            onClick={() => setJsonInput(DEFAULT_SAMPLE)}
          >
            Reset Sample
          </button>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>Input JSON</h2>
          </header>
          <textarea
            className={styles.textarea}
            value={formattedJson}
            onChange={(event) => setJsonInput(event.target.value)}
            rows={18}
            spellCheck={false}
          />
          <p className={styles.hint}>
            Provide product metadata, downloadable asset URL, and landing page.
          </p>
        </div>

        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h2>Output</h2>
            {result && (
              <div className={styles.downloads}>
                <button
                  onClick={() => downloadJson("marketing-assets", result)}
                  className={styles.linkButton}
                >
                  Download JSON
                </button>
                <a
                  href={result.master_assets_s3 ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.linkButton}
                >
                  Master Assets File
                </a>
                <a
                  href={result.research_insights_s3 ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.linkButton}
                >
                  Research Insights File
                </a>
              </div>
            )}
          </header>
          <div className={styles.output}>
            {state === "idle" && (
              <p className={styles.placeholder}>
                Click generate to produce platform-ready assets.
              </p>
            )}
            {state === "loading" && (
              <p className={styles.placeholder}>
                Crunching hooks, angles, and prompts...
              </p>
            )}
            {state === "error" && (
              <p className={styles.error}>Error: {error}</p>
            )}
            {state === "success" && result && (
              <div className={styles.results}>
                <div className={styles.summary}>
                  <strong>Status:</strong> {result.status.toUpperCase()}
                  <br />
                  <strong>Summary:</strong> {result.summary}
                </div>
                <div className={styles.platforms}>
                  {result.assets.map((asset) => (
                    <div key={asset.platform} className={styles.platformCard}>
                      <h3>{asset.platform.toUpperCase()}</h3>
                      <p className={styles.strategy}>{asset.strategyNotes}</p>
                      {asset.variants.map((variant, index) => (
                        <div
                          key={`${asset.platform}-${index}`}
                          className={styles.variant}
                        >
                          <header>
                            <span>Variant {index + 1}</span>
                            <span>{variant.angle}</span>
                          </header>
                          <pre>{variant.caption}</pre>
                          <p>
                            <strong>Hook:</strong> {variant.hook}
                          </p>
                          <p>
                            <strong>CTA:</strong> {variant.callToAction}
                          </p>
                          <p>
                            <strong>Hashtags:</strong>{" "}
                            {variant.hashtags.join(" ")}
                          </p>
                          <p>
                            <strong>Image Prompt:</strong> {variant.imagePrompt}
                          </p>
                          <p>
                            <strong>Keywords:</strong>{" "}
                            {variant.keywords.join(", ")}
                          </p>
                          <p>
                            <strong>Best Time:</strong>{" "}
                            {variant.recommendedPostingTime}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className={styles.insights}>
                  <h3>Research Insights</h3>
                  {result.research_insights.map((insight) => (
                    <article key={insight.title}>
                      <h4>{insight.title}</h4>
                      <p>{insight.insight}</p>
                      <p>
                        <strong>Action:</strong> {insight.action}
                      </p>
                    </article>
                  ))}
                  {result.review_recommendation && (
                    <p className={styles.review}>
                      {result.review_recommendation}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
