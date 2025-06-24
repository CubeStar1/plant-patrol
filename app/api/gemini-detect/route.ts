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
    const MODEL_NAME = "gemini-2.5-flash"; // Or "gemini-pro-vision"
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const insectClasses = [
      'Rice Leaf Folder', 'Rice Stem Borer', 'Rice Leaf Miner', 'Asian Corn Borer', 'Yellow Rice Borer',
      'Rice Gall Midge', 'Rice Stem Fly', 'Brown Planthopper', 'White-Backed Planthopper', 'Small Brown Planthopper',
      'Rice Water Weevil', 'Rice Leafhopper', 'Grain Thrips', 'Rice Ear Bug', 'White Grub', 'Mole Cricket', 'Wireworm',
      'White-Edged Moth', 'Black Cutworm', 'Large Cutworm', 'Yellow Cutworm', 'Red Spider Mite', 'Corn Borer',
      'Noctuid Moth', 'Aphid', 'White-Spotted Flower Chafer', 'Peach Fruit Borer', 'Long-Corned Cereal Aphid',
      'English Grain Aphid', 'Oat Bird-Cherry Aphid', 'Wheat Blossom Midge', 'Wheat Curl Mite', 'Long-Legged Spider Mite',
      'Wheat Stem Thrips', 'Wheat Sawfly', 'Wheat Blotch Leafminer', 'Beet Leafminer', 'Flea Beetle', 'Cabbage Looper',
      'Beet Armyworm', 'Beet Leafhopper', 'Meadow Moth', 'Beet Weevil', 'Mulberry Leaf Beetle', 'Alfalfa Weevil',
      'Alfalfa Looper', 'Alfalfa Plant Bug', 'Pasture Bug', 'Locust', 'Spanish Fly', 'Blister Beetle', 'Mylabris',
      'Alfalfa Aphid', 'Bull Thistle Thrips', 'Thrips', 'Alfalfa Seed Chalcid', 'Eastern Cabbage Butterfly',
      'Green Stink Bug', 'Slug Moth', 'Grape Phylloxera', 'Grape Erineum Mite', 'Grape Rust Mite',
      'Ten-Spotted Lady Beetle', 'Broad Mite', 'Comstock Mealybug', 'Grape Clearwing Moth', 'Grape Hawk Moth',
      'Spotted Lanternfly', 'Tiger Longhorn Beetle', 'Green Leafhopper', 'Plant Bug', 'Greenhouse Whitefly',
      'Two-Spotted Leafhopper', 'Citrus Swallowtail', 'Citrus Red Mite', 'Citrus Rust Mite', 'Cottony Cushion Scale',
      'Arrowhead Scale', 'Red Wax Scale', 'Brown Soft Scale', 'Black Scale', 'Mealybug', 'Citrus Psyllid',
      'Oriental Fruit Fly', 'Citrus Fruit Fly', 'Mediterranean Fruit Fly', 'Cotton Leafworm', 'Eriworm',
      'Citrus Leafminer Parasitoid', 'Citrus Aphid', 'Small Citrus Aphid', 'Apple Woolly Aphid', 'Mango Thrips',
      'Litchi Leaf Gall Midge', 'Tea White Moth Wax Cicada', 'Green Wax Scale', 'Mango Leaf-Cutting Weevil',
      'Mango Shoot Borer', 'Mango Flat-Headed Leafhopper', 'Stem Borer', 'Mango Seed Weevil', 'Leafhopper'
    ];

    const detectionPrompt = `
Detect all distinct objects in the image. Your primary focus is to identify pests, insects, and signs of disease on plants.

For each detected object, provide its bounding box as an array: [ymin, xmin, ymax, xmax, object_label].
The coordinates (ymin, xmin, ymax, xmax) must be scaled from 0 to 1000.
The object_label should be specific (e.g., "aphid", "powdery mildew", "spider mite").

Return all such bounding box arrays within a single JSON array.
If multiple instances of the same object type exist, provide separate bounding boxes for each.

Example for plant analysis: [[80,120,350,400,"aphid"], [500,600,700,750,"leaf with rust"]]

This application is primarily for pest detection on plants. However, also detect other common objects if they are present in the image.

If no objects are detected, return an empty array: [].

Here is a list of possible insect classes to help guide your detection:
${JSON.stringify(insectClasses, null, 2)}

Ensure your output is ONLY the JSON array of bounding boxes.
    `;

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
    return NextResponse.json({ error: "API Error" }, { status: 500 });
  }
}