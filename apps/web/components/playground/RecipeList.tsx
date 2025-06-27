import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Recipe } from '@types';

interface RecipeListProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  loading: boolean;
}

export const RecipeList = ({ recipes, onSelect, loading }: RecipeListProps) => {
  const [search, setSearch] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!search) return recipes;
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [recipes, search]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Input 
        placeholder="Search recipes..." 
        className="mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      {filteredRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center">
          <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-muted-foreground">
            {recipes.length === 0 
              ? "You haven't saved any recipes yet" 
              : "No recipes match your search"}
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-grow">
          <div className="space-y-2">
            {filteredRecipes.map(recipe => (
              <Button
                key={recipe.id}
                variant="outline"
                className="w-full text-left justify-start h-auto py-3 px-4"
                onClick={() => onSelect(recipe)}
              >
                <div className="flex flex-col items-start">
                  <div className="font-medium">{recipe.title}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {recipe.cuisine}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {recipe.prepTime} min
                    </Badge>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};