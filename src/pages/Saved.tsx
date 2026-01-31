import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, ChefHat, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { RecipeCardSkeleton } from '@/components/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Favorite {
  id: string;
  recipe_id: string;
  recipe_title: string;
  recipe_image: string | null;
  created_at: string;
}

export default function SavedPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: '/saved' } });
    } else if (user) {
      fetchFavorites();
    }
  }, [user, authLoading, navigate]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFavorites(favorites.filter((f) => f.id !== id));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl font-semibold">
              Saved Recipes
            </h1>
          </div>
          <p className="text-muted-foreground">
            Your favorite recipes, all in one place
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="font-display text-2xl font-semibold mb-2">No saved recipes yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring and save your favorite recipes
            </p>
            <Link to="/search">
              <Button className="gap-2">
                Explore Recipes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((favorite, index) => (
                <motion.div
                  key={favorite.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative"
                >
                  <Link
                    to={`/recipe/${favorite.recipe_id}`}
                    className="block bg-card rounded-xl overflow-hidden border border-border card-hover"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={favorite.recipe_image || '/placeholder.svg'}
                        alt={favorite.recipe_title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {favorite.recipe_title}
                      </h3>
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(favorite.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-card/90 backdrop-blur-sm rounded-full
                             text-muted-foreground hover:text-destructive hover:bg-destructive/10
                             transition-all opacity-0 group-hover:opacity-100"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}