import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  console.log(user);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.NEXT_PUBLIC_KINDWISE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("agrolens_images")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image." },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from("agrolens_images")
      .getPublicUrl(fileName);

    const fileBuffer = await file.arrayBuffer();
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

    const { error: dbError } = await supabase.from("plant_health_analyses").insert({
      user_id: user.id,
      image_url: publicUrl,
      result: data,
    });

    if (dbError) {
      console.error("Supabase DB error:", dbError);
      // We don't block the user if this fails, just log it.
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
