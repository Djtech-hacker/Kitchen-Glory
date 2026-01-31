import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Clock, ChefHat, Utensils, Cake } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipeCardSkeleton } from '@/components/SkeletonLoader';
import { Button } from '@/components/ui/button';
import { getFeaturedRecipes, type Recipe } from '@/lib/tastyService';

const categories = [
  { name: 'Quick Meals', icon: Clock, query: 'quick easy', color: 'bg-amber-100 text-amber-700' },
  { name: 'Baking', icon: Cake, query: 'baking', color: 'bg-rose-100 text-rose-700' },
  { name: 'Healthy', icon: Utensils, query: 'healthy', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Comfort Food', icon: ChefHat, query: 'comfort food', color: 'bg-purple-100 text-purple-700' },
];

const heroSlides = [
  {
    title: 'Discover Culinary Excellence',
    subtitle: 'Explore thousands of recipes from around the world',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop',
  },
  {
    title: 'Master the Art of Baking',
    subtitle: 'From sourdough to croissants, perfect your skills',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&h=800&fit=crop',
  },
  {
    title: 'Healthy & Delicious',
    subtitle: 'Nutritious meals that never compromise on taste',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=800&fit=crop',
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await getFeaturedRecipes();
        setFeaturedRecipes(data.results);
      } catch (error) {
        console.error('Error fetching featured recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Scroll Animation */}
      <section ref={heroRef} className="relative h-[85vh] min-h-[600px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <motion.div style={{ scale }} className="absolute inset-0">
              <img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          style={{ opacity, y }}
          className="relative h-full flex flex-col items-center justify-center px-6 text-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-md">
                {heroSlides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearch}
            className="w-full max-w-2xl"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What would you like to cook today?"
                className="w-full pl-14 pr-6 py-5 bg-card/95 backdrop-blur-sm rounded-2xl border border-border
                         text-foreground placeholder:text-muted-foreground text-lg
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                         shadow-lg transition-all"
              />
              <Search className="absolute left-5 w-5 h-5 text-muted-foreground" />
              <Button
                type="submit"
                className="absolute right-3 gap-2 rounded-xl"
              >
                Search
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.form>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-secondary">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-3">
              Browse by Category
            </h2>
            <p className="text-muted-foreground">
              Find the perfect recipe for any occasion
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/search?q=${encodeURIComponent(category.query)}`}
                  className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border
                           hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`p-3 rounded-lg ${category.color}`}>
                    <category.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-foreground">{category.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-2">
                Featured Recipes
              </h2>
              <p className="text-muted-foreground">
                Hand-picked favorites from our collection
              </p>
            </div>
            <Link
              to="/search"
              className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <RecipeCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredRecipes.map((recipe, index) => (
                <RecipeCard key={recipe.id} recipe={recipe} index={index} />
              ))}
            </div>
          )}

          <Link
            to="/search"
            className="sm:hidden flex items-center justify-center gap-2 mt-8 text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View All Recipes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              Start Your Culinary Journey
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Create an account to save your favorite recipes, rate dishes, and join our community of food lovers.
            </p>
            <Link to="/auth">
              <Button
                variant="secondary"
                size="lg"
                className="gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-primary" />
              <span className="font-display text-xl font-semibold">Kitchen Glory</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Kitchen Glory. All recipes powered by Tasty.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}