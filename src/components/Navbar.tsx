import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, User, Menu, X, ChefHat } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-primary" />
            <span className="font-display text-xl md:text-2xl font-semibold text-foreground">
              Kitchen Glory
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-64 lg:w-80 pl-10 pr-4 py-2.5 bg-secondary rounded-lg border border-border 
                         text-foreground placeholder:text-muted-foreground
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                         transition-all font-body text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </form>

            {/* Nav Links */}
            <Link 
              to="/search" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore
            </Link>

            {user ? (
              <>
                <Link 
                  to="/saved" 
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Saved
                </Link>
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="gap-2">
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border"
            >
              <div className="py-4 space-y-4">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search recipes..."
                    className="w-full pl-10 pr-4 py-3 bg-secondary rounded-lg border border-border 
                             text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                             font-body text-sm"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </form>

                {/* Mobile Links */}
                <div className="space-y-2">
                  <Link 
                    to="/search" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    Explore Recipes
                  </Link>
                  
                  {user ? (
                    <>
                      <Link 
                        to="/saved" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        Saved Recipes
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link 
                      to="/auth"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-primary font-medium hover:bg-secondary rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}