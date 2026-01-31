import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Users, Star } from 'lucide-react';
import type { Recipe } from '@/lib/tastyService';

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
}

export function RecipeCard({ recipe, index = 0 }: RecipeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link 
        to={`/recipe/${recipe.id}`}
        className="group block bg-card rounded-xl overflow-hidden border border-border card-hover"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={recipe.image || '/placeholder.svg'}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {recipe.rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-foreground">{recipe.rating}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          
          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {recipe.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {recipe.totalTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {recipe.totalTime}
              </span>
            )}
            {recipe.yields && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {recipe.yields}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}