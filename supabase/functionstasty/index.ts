import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
const RAPIDAPI_HOST = 'tasty.p.rapidapi.com';

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for: ${key}`);
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchFromTasty(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`https://tasty.p.rapidapi.com${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  console.log(`Fetching from Tasty API: ${url.toString()}`);

  const response = await fetch(url.toString(), {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY || '',
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    console.error(`Tasty API error: ${response.status} ${response.statusText}`);
    throw new Error(`Tasty API error: ${response.status}`);
  }

  return response.json();
}

function normalizeSearchResults(data: { results?: Array<Record<string, unknown>>; count?: number }) {
  const results = (data.results || []).map((item: Record<string, unknown>) => {
    const userRatings = item.user_ratings as Record<string, number> | undefined;
    return {
      id: item.id,
      title: item.name || item.title,
      image: item.thumbnail_url,
      description: item.description || '',
      totalTime: item.total_time_minutes ? `${item.total_time_minutes} min` : null,
      yields: item.yields || item.num_servings ? `${item.num_servings} servings` : null,
      rating: userRatings?.score ? Math.round(userRatings.score * 5) : null,
    };
  });

  return {
    results,
    total: data.count || results.length,
  };
}

function normalizeRecipeDetails(item: Record<string, unknown>) {
  const instructions = (item.instructions as Array<{ display_text: string }> || [])
    .map((step: { display_text: string }) => step.display_text);
  
  const sections = item.sections as Array<{ components: Array<{ raw_text: string }> }> || [];
  const ingredients = sections.flatMap((section) => 
    (section.components || []).map((comp) => comp.raw_text)
  );

  // Check for video URL
  let videoUrl = null;
  let youtubeUrl = null;
  
  if (item.original_video_url) {
    videoUrl = item.original_video_url as string;
  } else if (item.video_url) {
    videoUrl = item.video_url as string;
  }

  // Check if there's a YouTube URL in the credits or description
  const credits = item.credits as Array<{ url?: string }> || [];
  for (const credit of credits) {
    if (credit.url && credit.url.includes('youtube')) {
      youtubeUrl = credit.url;
      break;
    }
  }

  return {
    id: item.id,
    title: item.name,
    image: item.thumbnail_url,
    description: item.description,
    ingredients,
    steps: instructions,
    totalTimeMinutes: item.total_time_minutes,
    servings: item.num_servings,
    videoUrl,
    youtubeUrl,
    rating: item.user_ratings ? Math.round((item.user_ratings as Record<string, number>).score * 5) : null,
    nutrition: item.nutrition,
    tags: (item.tags as Array<{ display_name: string }> || []).map((tag) => tag.display_name),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (!RAPIDAPI_KEY) {
      console.error('RAPIDAPI_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'search') {
      const query = url.searchParams.get('query') || '';
      const from = url.searchParams.get('from') || '0';
      const size = url.searchParams.get('size') || '20';
      const tags = url.searchParams.get('tags') || '';

      const cacheKey = `search:${query}:${from}:${size}:${tags}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return new Response(
          JSON.stringify(cached),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const params: Record<string, string> = { q: query, from, size };
      if (tags) params.tags = tags;

      const data = await fetchFromTasty('/recipes/list', params);
      const normalized = normalizeSearchResults(data);
      
      setCache(cacheKey, normalized);

      return new Response(
        JSON.stringify(normalized),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'details') {
      const id = url.searchParams.get('id');
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Recipe ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const cacheKey = `details:${id}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return new Response(
          JSON.stringify(cached),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await fetchFromTasty('/recipes/get-more-info', { id });
      const normalized = normalizeRecipeDetails(data);
      
      setCache(cacheKey, normalized);

      return new Response(
        JSON.stringify(normalized),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'featured') {
      const cacheKey = 'featured';
      const cached = getCached(cacheKey);
      if (cached) {
        return new Response(
          JSON.stringify(cached),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await fetchFromTasty('/recipes/list', { from: '0', size: '8' });
      const normalized = normalizeSearchResults(data);
      
      setCache(cacheKey, normalized);

      return new Response(
        JSON.stringify(normalized),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'tags') {
      const cacheKey = 'tags';
      const cached = getCached(cacheKey);
      if (cached) {
        return new Response(
          JSON.stringify(cached),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await fetchFromTasty('/tags/list');
      
      setCache(cacheKey, data);

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: search, details, featured, or tags' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in tasty-api function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});