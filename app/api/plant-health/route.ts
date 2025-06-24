import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_KINDWISE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided." }, { status: 400 });
    }

    // Fetch the image from the URL and convert to base64
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image from URL." }, { status: 500 });
    }
    const fileBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(fileBuffer).toString("base64");

    const details = [
      "common_names",
      "url",
      "description",
      "treatment",
      "classification",
      "language",
      "entity_id",
    ].join(",");

    const apiUrl = "https://plant.id/api/v3/identification?language=en&details=" + details;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      body: JSON.stringify({
        images: [imageBase64],
        health: "all",
        similar_images: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Kindwise API error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to analyze plant health" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in plant-health API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
