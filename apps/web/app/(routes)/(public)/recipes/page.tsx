// apps/web/app/(routes)/(public)/recipe/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePlayground } from '@/hooks/usePlayground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Clock, Utensils, Flame, Star, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const RecipesPage = () => {
  const {
    savedRecipes,
    loading,
    error,
    handleDeleteRecipe,
    loadRecipe,
    currentRecipe,
    setCurrentRecipe
  } = usePlayground();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  // Filter recipes based on search and filters
  const filteredRecipes = savedRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCuisine = cuisineFilter === 'all' || recipe.cuisine?.toLowerCase() === cuisineFilter;
    const matchesDiet = dietFilter === 'all' || recipe.diet === dietFilter;
    
    return matchesSearch && matchesCuisine && matchesDiet;
  });

  // Get unique cuisines for filter options
  const cuisines = ['all', ...new Set(savedRecipes.map(recipe => recipe.cuisine || '').filter(Boolean))];
  
  // Handle recipe deletion
  const confirmDelete = (id: string) => {
    setRecipeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (recipeToDelete) {
      await handleDeleteRecipe(recipeToDelete);
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Your Recipe Collection</h1>
        <p className="text-muted-foreground">
          Discover, create, and manage your favorite recipes
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search recipes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12"
          />
        </div>
        <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Cuisine" />
          </SelectTrigger>
          <SelectContent>
            {cuisines.map(cuisine => (
              <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                {cuisine === 'all' ? 'All Cuisines' : cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dietFilter} onValueChange={setDietFilter}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Diet" />
          </SelectTrigger>
          <SelectContent>
            {['all', 'vegetarian', 'vegan', 'gluten-free', 'keto', 'paleo'].map(diet => (
              <SelectItem key={diet} value={diet}>
                {diet === 'all' ? 'All Diets' : diet.charAt(0).toUpperCase() + diet.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && !savedRecipes.length && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full rounded-lg mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !filteredRecipes.length && (
        <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Utensils className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No recipes found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || cuisineFilter !== 'all' || dietFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by generating your first recipe!'}
          </p>
          <Button asChild>
            <Link href="/playground">Generate Recipe</Link>
          </Button>
        </div>
      )}

      {/* Recipes Grid */}
      {!loading && filteredRecipes.length > 0 && (
        <Tabs defaultValue="grid" className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="px-3 py-1">
                {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Recipe' : 'Recipes'}
              </Badge>
              <Badge variant="outline">
                <Clock className="h-4 w-4 mr-1" />
                Avg. {Math.round(filteredRecipes.reduce((sum, recipe) => sum + recipe.cookTime, 0) / filteredRecipes.length)} min
              </Badge>
            </div>
            
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onView={() => loadRecipe(recipe.id)}
                  onDelete={() => confirmDelete(recipe.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <div className="space-y-4">
              {filteredRecipes.map((recipe) => (
                <RecipeListItem 
                  key={recipe.id} 
                  recipe={recipe} 
                  onView={() => loadRecipe(recipe.id)}
                  onDelete={() => confirmDelete(recipe.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Recipe Detail Modal */}
      {currentRecipe && (
        <Dialog open={!!currentRecipe} onOpenChange={() => setCurrentRecipe(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{currentRecipe.title}</DialogTitle>
              <DialogDescription>
                {currentRecipe.description || 'Delicious recipe created just for you'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={currentRecipe.imageUrl || '/placeholder-recipe.jpg'}
                    alt={currentRecipe.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Clock className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="font-medium">{currentRecipe.cookTime} min</p>
                    <p className="text-sm text-muted-foreground">Prep time</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Utensils className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="font-medium">{currentRecipe.servings} servings</p>
                    <p className="text-sm text-muted-foreground">Serves</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <Flame className="h-6 w-6 mx-auto mb-1 text-primary" />
                    <p className="font-medium capitalize">{currentRecipe.preferences?.spiceLevel || 'Medium'}</p>
                    <p className="text-sm text-muted-foreground">Spice level</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <ul className="mb-6 space-y-2">
                  {currentRecipe.ingredients.map((ingredient: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      <span>
                        {ingredient.quantity && (
                          <span className="font-medium mr-1">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        )}
                        {ingredient.name}
                        {ingredient.note && (
                          <span className="text-muted-foreground text-sm ml-1">({ingredient.note})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <h3 className="font-semibold mb-2">Instructions</h3>
                <ol className="space-y-3">
                  {currentRecipe.instructions.split('\n').filter(step => step.trim()).map((step, index) => (
                    <li key={index} className="flex">
                      <span className="font-medium min-w-[28px]">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCurrentRecipe(null)}>
                Close
              </Button>
              <Button asChild>
                <Link href={`/recipe/${currentRecipe.id}/edit`}>Edit Recipe</Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Recipe Card Component
const RecipeCard = ({ recipe, onView, onDelete }: { 
  recipe: any; 
  onView: () => void; 
  onDelete: () => void; 
}) => (
  <Card className="h-full flex flex-col transition-transform hover:scale-[1.02] hover:shadow-lg">
    <div className="relative h-48">
      <Image
        src={recipe.imageUrl || '/placeholder-recipe.jpg'}
        alt={recipe.title}
        fill
        className="object-cover rounded-t-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      <Badge className="absolute top-2 right-2 bg-white/90 text-foreground backdrop-blur-sm">
        <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
        {recipe.rating || '5.0'}
      </Badge>
    </div>
    <CardHeader>
      <CardTitle className="text-lg line-clamp-1">{recipe.title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="secondary">
          <Clock className="h-4 w-4 mr-1" />
          {recipe.cookTime} min
        </Badge>
        {recipe.diet && recipe.diet !== 'none' && (
          <Badge variant="outline">{recipe.diet}</Badge>
        )}
        {recipe.cuisine && (
          <Badge variant="outline">{recipe.cuisine}</Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {recipe.description || 'Delicious recipe created just for you'}
      </p>
    </CardContent>
    <CardFooter className="flex justify-between gap-2">
      <Button variant="outline" size="sm" onClick={onView}>
        View
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete}>
        Delete
      </Button>
    </CardFooter>
  </Card>
);

// Recipe List Item Component
const RecipeListItem = ({ recipe, onView, onDelete }: { 
  recipe: any; 
  onView: () => void; 
  onDelete: () => void; 
}) => (
  <Card className="flex overflow-hidden hover:shadow-md transition-shadow">
    <div className="relative w-32 flex-shrink-0 hidden sm:block">
      <Image
        src={recipe.imageUrl || '/placeholder-recipe.jpg'}
        alt={recipe.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
    <div className="flex-grow p-4 flex flex-col">
      <div className="flex-grow">
        <CardTitle className="text-lg mb-1">{recipe.title}</CardTitle>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="secondary">
            <Clock className="h-4 w-4 mr-1" />
            {recipe.cookTime} min
          </Badge>
          {recipe.diet && recipe.diet !== 'none' && (
            <Badge variant="outline">{recipe.diet}</Badge>
          )}
          {recipe.cuisine && (
            <Badge variant="outline">{recipe.cuisine}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {recipe.description || 'Delicious recipe created just for you'}
        </p>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={onView}>
          View Details
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
    <div className="flex items-center px-4">
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  </Card>
);

export default RecipesPage;