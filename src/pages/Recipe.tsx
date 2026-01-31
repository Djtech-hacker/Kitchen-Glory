import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Heart, HeartOff, ArrowLeft, Check, ChefHat } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { VideoEmbed } from '@/components/VideoEmbed';
import { RatingStars } from '@/components/RatingStars';
import { Comments } from '@/components/Comments';
import { RecipeDetailSkeleton } from '@/components/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { getRecipeDetails, type RecipeDetails } from '@/lib/tastyService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (id) {
      fetchRecipe();
      if (user) {
        checkFavorite();
        fetchUserRating();
      }
      fetchAverageRating();
    }
  }, [id, user]);

  const fetchRecipe = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecipeDetails(id!);
      setRecipe(data);
    } catch (err) {
      console.error('Error fetching recipe:', err);
      setError('Failed to load recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user!.id)
      .eq('recipe_id', id!)
      .single();
    setIsFavorite(!!data);
  };

  const fetchUserRating = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('rating')
      .eq('user_id', user!.id)
      .eq('recipe_id', id!)
      .single();
    if (data) setUserRating(data.rating);
  };

  const fetchAverageRating = async () => {
    const { data } = await supabase
      .from('ratings')
      .select('rating')
      .eq('recipe_id', id!);
    
    if (data && data.length > 0) {
      const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
      setAverageRating(Math.round(avg * 10) / 10);
      setTotalRatings(data.length);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', id!);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          recipe_id: id!,
          recipe_title: recipe?.title || '',
          recipe_image: recipe?.image || null,
        });
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleRate = async (rating: number) => {
    if (!user) {
      toast.error('Please sign in to rate recipes');
      return;
    }

    try {
      const { error } = await supabase
        .from('ratings')
        .upsert({
          user_id: user.id,
          recipe_id: id!,
          rating,
        }, {
          onConflict: 'user_id,recipe_id',
        });

      if (error) throw error;

      setUserRating(rating);
      fetchAverageRating();
      toast.success('Rating saved!');
    } catch (error) {
      console.error('Error rating recipe:', error);
      toast.error('Failed to save rating');
    }
  };

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <RecipeDetailSkeleton />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-16 text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="font-display text-2xl font-semibold mb-2">Recipe not found</h2>
          <p className="text-muted-foreground mb-6">{error || "We couldn't find this recipe."}</p>
          <Link to="/search">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Browse Recipes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container-custom py-8">
        {/* Back Link */}
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to recipes
        </Link>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Video/Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <VideoEmbed
              videoUrl={recipe.videoUrl}
              youtubeUrl={recipe.youtubeUrl}
              title={recipe.title}
              thumbnail={recipe.image}
            />
          </motion.div>

          {/* Recipe Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {recipe.title}
            </h1>

            {recipe.description && (
              <p className="text-muted-foreground text-lg">
                {recipe.description}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              {recipe.totalTimeMinutes && (
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {recipe.totalTimeMinutes} min
                </span>
              )}
              {recipe.servings && (
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {recipe.servings} servings
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <RatingStars
                  rating={averageRating}
                  totalRatings={totalRatings}
                  size="lg"
                />
              </div>
              {user && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Your rating:</span>
                  <RatingStars
                    rating={userRating}
                    interactive
                    onRate={handleRate}
                    showCount={false}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={toggleFavorite}
                variant={isFavorite ? 'default' : 'outline'}
                className="gap-2"
              >
                {isFavorite ? (
                  <>
                    <HeartOff className="w-4 h-4" />
                    Remove from Saved
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Save Recipe
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="font-display text-2xl font-semibold mb-4">
                Ingredients
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Steps & Comments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-12"
          >
            {/* Steps */}
            <div>
              <h2 className="font-display text-2xl font-semibold mb-6">
                Instructions
              </h2>
              <div className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <div
                    key={index}
                    onClick={() => toggleStep(index)}
                    className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      checkedSteps.has(index)
                        ? 'bg-secondary/50 border-primary/30'
                        : 'bg-card border-border hover:border-primary/20'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        checkedSteps.has(index)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {checkedSteps.has(index) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <p
                      className={`text-muted-foreground pt-1 ${
                        checkedSteps.has(index) ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <Comments recipeId={id!} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}