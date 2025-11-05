import { NextResponse } from "next/server";
import { marketingAgentInputSchema } from "@/lib/validation";
import { generateMarketingResponse } from "@/lib/marketingGenerator";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const validated = marketingAgentInputSchema.parse(payload);
    const result = await generateMarketingResponse(validated);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generation error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Unexpected error" },
      { status: 500 }
    );
  }
}
