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

async function callTastyApi(action: string, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams({ action, ...params });
  
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tasty-api?${searchParams}`,
    {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function searchRecipes(
  query: string,
  options: { from?: number; size?: number; tags?: string } = {}
): Promise<SearchResult> {
  const params: Record<string, string> = {
    query,
    from: String(options.from || 0),
    size: String(options.size || 20),
  };
  
  if (options.tags) {
    params.tags = options.tags;
  }

  return callTastyApi('search', params);
}

export async function getRecipeDetails(id: string | number): Promise<RecipeDetails> {
  return callTastyApi('details', { id: String(id) });
}

export async function getFeaturedRecipes(): Promise<SearchResult> {
  return callTastyApi('featured');
}

export async function getTags(): Promise<{ results: Array<{ id: number; name: string; display_name: string; type: string }> }> {
  return callTastyApi('tags');
}