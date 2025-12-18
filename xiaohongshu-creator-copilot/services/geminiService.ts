import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedPostContent } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const textModel = 'gemini-2.5-flash';
const imageModel = 'gemini-2.5-flash-image';

// Schema for structured JSON output
const postSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A viral Xiaohongshu title. Must use emojis, brackets 【】, and numbers. High CTR.",
    },
    content: {
      type: Type.STRING,
      description: "The post content formatted for slides. Use '---' on a new line to separate each slide (Intro, Step 1, Step 2... Conclusion). Use emojis. Professional yet friendly.",
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5-10 relevant hashtags",
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A detailed English prompt for a lifestyle image. Focus on aesthetic, lighting, and composition.",
    },
  },
  required: ["title", "content", "tags", "imagePrompt"],
};

export const generatePostText = async (inspiration: string): Promise<GeneratedPostContent> => {
  const systemInstruction = `
    You are a top-tier Xiaohongshu (Little Red Book) content creator (100k+ followers) known for "Nanny-level" (保姆级) tutorials.
    
    YOUR GOAL: Turn the user's idea into a multi-page carousel post (图文).
    
    STRICT CONTENT RULES:
    1. **NO FLUFF**: Actionable steps only.
    2. **SLIDE FORMATTING**: You MUST use '---' (triple dash) on a new line to separate content into pages/slides.
       - **Slide 1 (Intro)**: Hook the reader, state the problem/result.
       - **Slide 2, 3, 4... (Steps)**: Break the method into clear steps. One major step per slide.
       - **Last Slide (Outro)**: Summary + Call to Action.
    3. **EMPHASIS**: You **MUST** use double asterisks (\`**keyword**\`) to highlight key tools, numbers, or results. These will be highlighted in the final design.
    4. **STRUCTURE**:
       - **Headline**: Clickbait, high emotion or benefit.
       - **Content**: Split into 4-6 slides using '---'.
    5. **TONE**: Enthusiastic, authentic, detailed. Use XHS slang (e.g., 绝绝子, 亲测有效, 避雷).
    
    Input Idea: "${inspiration}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: inspiration,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: postSchema,
        temperature: 0.85, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Gemini");
    
    return JSON.parse(text) as GeneratedPostContent;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

const generateSingleImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: "3:4"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

export const generatePostImages = async (basePrompt: string, count: number = 5): Promise<string[]> => {
  // Generate 5 variations in parallel using different style suffixes to ensure variety
  const styleVariations = [
    "cinematic lighting, shallow depth of field, 4k resolution, highly detailed",
    "bright natural sunlight, minimalist aesthetic, clean composition, high quality",
    "warm cozy atmosphere, soft shadows, film grain, authentic vibe",
    "studio lighting, sharp focus, professional product photography style",
    "POV shot, candid lifestyle, iPhone photography style, authentic"
  ];

  // Ensure we have enough styles for the count, or cycle them
  const promises = Array.from({ length: count }).map((_, i) => {
      const style = styleVariations[i % styleVariations.length];
      const fullPrompt = `${basePrompt}. Style: ${style}`; 
      return generateSingleImage(fullPrompt);
  });

  const results = await Promise.allSettled(promises);
  
  const images = results
    .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
    .map(result => result.value);

  if (images.length === 0) {
     throw new Error("Failed to generate any images.");
  }

  return images;
};