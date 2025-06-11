import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";



interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  label: string;
}

// Helper function to parse Gemini's text response into bounding boxes
function parseBoundingBoxResponse(responseText: string): BoundingBox[] {
  try {
    // Attempt to extract JSON array from the response text
    // Gemini might wrap the JSON in backticks or include other text.
    const jsonMatch = responseText.match(/```json\n(\[[\s\S]*\])\n```|(\[[\s\S]*\])/);
    let parsableJsonString = null;

    if (jsonMatch) {
      parsableJsonString = jsonMatch[1] || jsonMatch[2]; // Use the first captured group that's not null
    }

    if (!parsableJsonString) {
      console.warn("Could not extract JSON array from responseText:", responseText);
      // Attempt to parse directly if no JSON markers are found, assuming the response might be a direct JSON array string
      try {
        const directParsedData = JSON.parse(responseText);
        if (Array.isArray(directParsedData)) {
          parsableJsonString = responseText;
        } else {
          return [];
        }
      } catch (e) {
        console.warn("Direct parsing also failed:", e);
        return [];
      }
    }

    const parsedData = JSON.parse(parsableJsonString);
    if (!Array.isArray(parsedData)) {
      console.warn("Parsed data is not an array:", parsedData);
      return [];
    }

    const boxes: BoundingBox[] = [];
    for (const item of parsedData) {
      // Expect item to be an array: [ymin, xmin, ymax, xmax, label]
      if (Array.isArray(item) && item.length === 5) {
        const [yminStr, xminStr, ymaxStr, xmaxStr, label] = item;
        const ymin = parseInt(String(yminStr), 10);
        const xmin = parseInt(String(xminStr), 10);
        const ymax = parseInt(String(ymaxStr), 10);
        const xmax = parseInt(String(xmaxStr), 10);

        if (![ymin, xmin, ymax, xmax].some(isNaN) && typeof label === 'string') {
          boxes.push({ ymin, xmin, ymax, xmax, label });
        } else {
          console.warn("Skipping invalid item due to NaN coordinates or non-string label:", item);
        }
      } else {
        console.warn("Skipping invalid item (not an array of 5 elements):", item);
      }
    }
    return boxes;
  } catch (error) {
    console.error("Error parsing bounding box JSON response:", error, "\nResponse text was:", responseText);
    return []; // Return empty array on parsing error
  }
}

async function fileToGenerativePart(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64EncodedData = buffer.toString("base64");

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

export async function POST(req: NextRequest) {
    const MODEL_NAME = "gemini-2.0-flash"; // Or "gemini-pro-vision"
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const detectionPrompt = `Detect all distinct objects in the image, with a special focus on identifying pests, insects, and signs of disease on plants. For each object, provide its bounding box as an array [ymin, xmin, ymax, xmax, object_label] where coordinates are scaled from 0 to 1000. The label should be specific (e.g., "aphid", "powdery mildew", "spider mite"). Return all such bounding box arrays within a single JSON array. If multiple instances of the same object type exist, provide separate bounding boxes for each. Example for plant analysis: [[80,120,350,400,"aphid"], [500,600,700,750,"leaf with rust"]]. The primary application is pest detection on plants, but also detect other objects if present. If no objects are detected, return an empty array.`;

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const imagePart = await fileToGenerativePart(imageFile);

    const generationConfig = {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 8192, // Increased max output tokens
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [imagePart, { text: detectionPrompt }] }],
        generationConfig,
        safetySettings,
    });

    const responseText = result.response.text();
    const boxes = parseBoundingBoxResponse(responseText);
    
    if (boxes.length === 0 && responseText.trim() !== "") {
        console.warn("Gemini API returned text but no bounding boxes were parsed:", responseText);
    }

    return NextResponse.json({ boxes, rawResponse: responseText }); // Include rawResponse for debugging

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    // Check if the error object has a more specific message from the API
    const message = error.response?.data?.error?.message || error.message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}