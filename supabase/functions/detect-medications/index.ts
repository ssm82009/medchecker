
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not set in environment variables');
    }

    // Parse the request body to get the image data
    const { image } = await req.json();
    if (!image) {
      throw new Error('No image data provided');
    }

    console.log('Received image data, sending to OpenAI for processing...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a medication identification assistant. Analyze the provided image to identify any medication names visible on packaging, bottles, or blister packs.
            Focus only on identifying actual medication names. Do not include dosage, company names, or other text unless they are part of the official medication name.
            Return only a JSON array of medication names, with no other text. If no medications can be identified, return an empty array.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify all medication names visible in this image:' },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ],
        max_tokens: 300,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    // Parse the response to extract medication names
    let medications = [];
    try {
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        medications = Array.isArray(parsed.medications) ? parsed.medications : [];
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      medications = [];
    }

    return new Response(
      JSON.stringify({ medications }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error processing image', 
        medications: [] 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
