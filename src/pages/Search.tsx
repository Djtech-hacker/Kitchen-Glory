import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X, ChefHat } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { RecipeCard } from '@/components/RecipeCard';
import { SearchResultsSkeleton } from '@/components/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { searchRecipes, type Recipe } from '@/lib/tastyService';

const filterTags = [
  { label: 'Under 30 min', value: 'under_30_minutes' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Healthy', value: 'healthy' },
  { label: 'Easy', value: 'easy' },
  { label: 'Baking', value: 'baking' },
  { label: 'Desserts', value: 'desserts' },
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Lunch', value: 'lunch' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q, 0, selectedTags);
    } else {
      // Load featured if no query
      performSearch('', 0, selectedTags);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string, pageNum: number, tags: string[]) => {
    setLoading(true);
    try {
      const tagsParam = tags.join(',');
      const data = await searchRecipes(searchQuery, {
        from: pageNum * pageSize,
        size: pageSize,
        tags: tagsParam || undefined,
      });
      
      if (pageNum === 0) {
        setRecipes(data.results);
      } else {
        setRecipes((prev) => [...prev, ...data.results]);
      }
      setTotal(data.total);
      setPage(pageNum);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    performSearch(query, 0, selectedTags);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    performSearch(query, 0, newTags);
  };

  const clearFilters = () => {
    setSelectedTags([]);
    performSearch(query, 0, []);
  };

  const loadMore = () => {
    performSearch(query, page + 1, selectedTags);
  };

  const hasMore = recipes.length < total;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container-custom py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-semibold mb-6">
            {query ? `Results for "${query}"` : 'Explore Recipes'}
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for recipes..."
                className="w-full pl-12 pr-4 py-3.5 bg-card rounded-xl border border-border
                         text-foreground placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                         transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
            <Button type="submit" size="lg">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {selectedTags.length > 0 && (
                <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center">
                  {selectedTags.length}
                </span>
              )}
            </Button>
          </form>

          {/* Filter Tags */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border rounded-xl p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">Filter by:</span>
                {selectedTags.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {filterTags.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => toggleTag(tag.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedTags.includes(tag.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {tag.label}
                    {selectedTags.includes(tag.value) && (
                      <X className="inline w-3 h-3 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          {!loading && recipes.length > 0 && (
            <p className="text-muted-foreground">
              Showing {recipes.length} of {total} recipes
            </p>
          )}
        </motion.div>

        {/* Results */}
        {loading && recipes.length === 0 ? (
          <SearchResultsSkeleton />
        ) : recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="font-display text-2xl font-semibold mb-2">No recipes found</h2>
            <p className="text-muted-foreground mb-6">
              Try a different search term or browse our categories
            </p>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={index} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                  size="lg"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}