import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

function normalizeNutrition(rawNutrition: Record<string, unknown> | undefined) {
  if (!rawNutrition || typeof rawNutrition !== 'object') return {};

  const numericKeys = [
    'calories_kcal',
    'protein_g',
    'carbohydrates_g',
    'fat_g',
    'fiber_g',
    'sugar_g',
    'vitamin_c_mg',
  ];

  const nutrition: Record<string, number> = {};

  for (const key of numericKeys) {
    const value = rawNutrition[key];
    const parsed = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(parsed)) nutrition[key] = parsed;
  }

  return nutrition;
}

function normalizeVitamins(rawVitamins: Record<string, unknown> | undefined) {
  if (!rawVitamins || typeof rawVitamins !== 'object') {
    return {
      vitamin_a_mcg: 0,
      vitamin_c_mg: 0,
      vitamin_d_mcg: 0,
      vitamin_e_mg: 0,
      vitamin_k_mcg: 0,
      vitamin_b1_mg: 0,
      vitamin_b2_mg: 0,
      vitamin_b3_mg: 0,
      vitamin_b6_mg: 0,
      folate_mcg: 0,
      vitamin_b12_mcg: 0,
      calcium_mg: 0,
      iron_mg: 0,
      magnesium_mg: 0,
      potassium_mg: 0,
      zinc_mg: 0,
    };
  }

  const vitaminKeys = [
    'vitamin_a_mcg',
    'vitamin_c_mg',
    'vitamin_d_mcg',
    'vitamin_e_mg',
    'vitamin_k_mcg',
    'vitamin_b1_mg',
    'vitamin_b2_mg',
    'vitamin_b3_mg',
    'vitamin_b6_mg',
    'folate_mcg',
    'vitamin_b12_mcg',
    'calcium_mg',
    'iron_mg',
    'magnesium_mg',
    'potassium_mg',
    'zinc_mg',
  ];

  const vitamins: Record<string, number> = {};

  for (const key of vitaminKeys) {
    const value = rawVitamins[key];
    const parsed = typeof value === 'number' ? value : Number(value);
    vitamins[key] = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  return vitamins;
}

function sanitizeFoodPayload(payload: any) {
  if (!payload || typeof payload !== 'object') return null;

  const foodName = typeof payload.food_name === 'string' ? payload.food_name.trim() : 'Identified Food';
  const confidence = Number(payload.confidence);
  const description = typeof payload.description === 'string' ? payload.description.trim() : 'Food identified successfully';
  const servingSize = typeof payload.serving_size === 'string' ? payload.serving_size.trim() : 'Estimated serving';

  const nutrition = normalizeNutrition(payload.nutrition);
  const vitamins = normalizeVitamins(payload.vitamins);

  return {
    food_name: foodName,
    confidence: Number.isFinite(confidence) ? Math.min(Math.max(confidence, 0), 1) : 0.5,
    description,
    serving_size: servingSize,
    nutrition,
    vitamins,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse({ success: true }, 200);
  }

  try {
    const body = await req.json();
    const imageBase64 = body?.imageBase64;
    const mimeType = body?.mimeType || 'image/jpeg';

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return jsonResponse({ success: false, error: 'Image data is required.' }, 400);
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing.');
      return jsonResponse({ success: false, error: 'Gemini API key is not configured.' }, 500);
    }

    const prompt = `You are an expert AI clinical nutritionist specializing in Indian and Telugu cuisine (Andhra Pradesh & Telangana). Analyze this food image and return ONLY valid JSON with this exact structure:
{
  "food_name": "MLA Pesarattu with Upma",
  "telugu_name": "ఎం.ఎల్.ఏ పెసరట్టు ఉప్మా",
  "confidence": 0.96,
  "description": "Traditional Andhra green gram (moong dal) crepe stuffed with semolina upma, served with ginger chutney.",
  "serving_size": "1 medium pesarattu (~180g) with 1 small katori upma",
  "glycemic_load": "Medium",
  "poshak_score": 88,
  "telugu_health_tip": "పెసరట్టులో ప్రోటీన్ మరియు పీచు పదార్థాలు ఎక్కువగా ఉంటాయి. రక్తంలో చక్కర స్థాయిలను అదుపులో ఉంచుతుంది.",
  "nutrition": {
    "calories_kcal": 280,
    "protein_g": 12.5,
    "carbohydrates_g": 42,
    "fat_g": 6.8,
    "fiber_g": 7.2,
    "sugar_g": 2.1,
    "vitamin_c_mg": 14
  },
  "vitamins": {
    "vitamin_a_mcg": 45,
    "vitamin_c_mg": 14,
    "vitamin_d_mcg": 0,
    "vitamin_e_mg": 0.8,
    "vitamin_k_mcg": 6.5,
    "vitamin_b1_mg": 0.22,
    "vitamin_b2_mg": 0.15,
    "vitamin_b3_mg": 1.8,
    "vitamin_b6_mg": 0.28,
    "folate_mcg": 65,
    "vitamin_b12_mcg": 0,
    "calcium_mg": 52,
    "iron_mg": 3.4,
    "magnesium_mg": 78,
    "potassium_mg": 340,
    "zinc_mg": 1.4
  }
}
Rules:
- Identify Telugu & Indian foods precisely (e.g. Pesarattu, Ragi Sangati, Jonna Rotte, Muddapappu, Gongura Pappu, Dibba Rotti, Gutti Vankaya, Avakaya, Hyderabadi Biryani, Ulava Charu, Bobbarlu, Chepala Pulusu).
- Provide serving sizes in traditional Indian household measures (e.g. '1 Katori (~150g)', '2 Rotti (~80g)', '1 Plate').
- Provide telugu_name in Telugu script (e.g., 'రైస్ మరియు ముద్దపప్పు').
- Include poshak_score (0-100 score based on nutrient density per ICMR-NIN RDA guidelines).
- Include telugu_health_tip with actionable Telugu advice on health benefits, glycemic control, or sodium management.
- Keep all existing nutrition and vitamin keys exactly as shown.
- Return valid JSON only, with no markdown formatting, no explanations, and no trailing commas.`;


    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generationConfig: {
          responseMimeType: 'application/json',
        },
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      }),
    });

    const geminiText = await geminiResponse.text();

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', geminiText);
      return jsonResponse({ success: false, error: 'Gemini analysis failed.' }, 502);
    }

    let parsedGemini: any;
    try {
      parsedGemini = JSON.parse(geminiText);
    } catch (e) {
      console.error('Invalid Gemini JSON response:', geminiText);
      return jsonResponse({ success: false, error: 'Invalid response from Gemini.' }, 502);
    }

    const candidateText = parsedGemini?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text).join('') || '';
    if (!candidateText) {
      return jsonResponse({ success: false, error: 'No food analysis returned.' }, 502);
    }

    let parsedFood;
    try {
      parsedFood = JSON.parse(candidateText);
    } catch (e) {
      const cleanedText = candidateText.replace(/```json|```/g, '').trim();
      try {
        parsedFood = JSON.parse(cleanedText);
      } catch (cleanErr) {
        console.error('Unable to parse Gemini food JSON:', candidateText);
        return jsonResponse({ success: false, error: 'Food analysis format was invalid.' }, 502);
      }
    }

    const food = sanitizeFoodPayload(parsedFood);
    if (!food) {
      return jsonResponse({ success: false, error: 'Food analysis result was invalid.' }, 502);
    }

    return jsonResponse({
      success: true,
      food,
    });
  } catch (error) {
    console.error('Edge function failed:', error);
    return jsonResponse({ success: false, error: 'Food analysis failed.' }, 500);
  }
});
