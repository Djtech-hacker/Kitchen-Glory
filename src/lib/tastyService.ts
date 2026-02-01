export interface Recipe {
  id: number;
  title: string;
  image: string;
  description: string;
  totalTime: string | null;
  yields: string | null;
  rating: number | null;
}

export interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  description: string;
  ingredients: string[];
  steps: string[];
  totalTimeMinutes: number | null;
  servings: number | null;
  videoUrl: string | null;
  youtubeUrl: string | null;
  rating: number | null;
  nutrition: Record<string, unknown> | null;
  tags: string[];
}

export interface SearchResult {
  results: Recipe[];
  total: number;
}

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'tasty.p.rapidapi.com';

async function callTastyApi(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`https://${RAPIDAPI_HOST}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

function transformRecipe(item: any): Recipe {
  return {
    id: item.id,
    title: item.name || item.title || 'Untitled Recipe',
    image: item.thumbnail_url || item.image || '',
    description: item.description || item.seo_title || '',
    totalTime: item.total_time_minutes ? `${item.total_time_minutes} min` : null,
    yields: item.num_servings ? `${item.num_servings} servings` : null,
    rating: item.user_ratings?.score || null,
  };
}

export async function searchRecipes(
  query: string,
  options: { from?: number; size?: number; tags?: string } = {}
): Promise<SearchResult> {
  const params: Record<string, string> = {
    q: query,
    from: String(options.from || 0),
    size: String(options.size || 20),
  };
  
  if (options.tags) {
    params.tags = options.tags;
  }

  const data = await callTastyApi('recipes/list', params);
  
  return {
    results: (data.results || []).map(transformRecipe),
    total: data.count || 0,
  };
}

export async function getRecipeDetails(id: string | number): Promise<RecipeDetails> {
  const data = await callTastyApi('recipes/get-more-info', { id: String(id) });
  
  const recipe = data;
  const instructions = recipe.instructions || [];
  const sections = recipe.sections || [];
  
  // Extract ingredients
  const ingredients: string[] = [];
  sections.forEach((section: any) => {
    section.components?.forEach((component: any) => {
      const ingredient = component.ingredient?.name || '';
      const measurements = component.measurements?.map((m: any) => 
        `${m.quantity || ''} ${m.unit?.name || ''}`
      ).join(' ') || '';
      ingredients.push(`${measurements} ${ingredient}`.trim());
    });
  });

  // Extract steps
  const steps = instructions.map((instruction: any) => 
    instruction.display_text || ''
  ).filter(Boolean);

  return {
    id: recipe.id,
    title: recipe.name || 'Untitled Recipe',
    image: recipe.thumbnail_url || '',
    description: recipe.description || recipe.seo_title || '',
    ingredients,
    steps,
    totalTimeMinutes: recipe.total_time_minutes || null,
    servings: recipe.num_servings || null,
    videoUrl: recipe.original_video_url || null,
    youtubeUrl: recipe.youtube_url || null,
    rating: recipe.user_ratings?.score || null,
    nutrition: recipe.nutrition || null,
    tags: recipe.tags?.map((tag: any) => tag.display_name || tag.name) || [],
  };
}

export async function getFeaturedRecipes(): Promise<SearchResult> {
  const data = await callTastyApi('recipes/list', { from: '0', size: '20' });
  
  return {
    results: (data.results || []).map(transformRecipe),
    total: data.count || 0,
  };
}

export async function getTags(): Promise<{ results: Array<{ id: number; name: string; display_name: string; type: string }> }> {
  const data = await callTastyApi('tags/list', {});
  return { results: data.results || [] };
}
