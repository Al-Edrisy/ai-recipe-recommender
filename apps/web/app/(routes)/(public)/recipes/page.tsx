// apps/web/app/(routes)/(public)/recipe/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlayground } from '@/hooks/usePlayground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Clock, 
  Utensils, 
  Flame, 
  Star, 
  ChevronRight,
  Salad,
  Vegan,
  Wheat,
  Beef,
  Pizza,
  Croissant,
  Soup,
  Sandwich,
  CakeSlice,
  IceCream,
  Trash2,
  Eye,
  Plus,
  ChefHat
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const cuisineIcons: Record<string, JSX.Element> = {
  italian: <Pizza className="h-5 w-5" />,
  mexican: <Beef className="h-5 w-5" />,
  french: <Croissant className="h-5 w-5" />,
  chinese: <Soup className="h-5 w-5" />,
  american: <Sandwich className="h-5 w-5" />,
  dessert: <CakeSlice className="h-5 w-5" />,
  vegan: <Vegan className="h-5 w-5" />,
  vegetarian: <Salad className="h-5 w-5" />,
  default: <ChefHat className="h-5 w-5" />
};

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

  // Get icon for cuisine type
  const getCuisineIcon = (cuisine: string) => {
    const normalizedCuisine = cuisine.toLowerCase();
    return cuisineIcons[normalizedCuisine] || cuisineIcons.default;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
          <ChefHat className="h-10 w-10 text-primary" />
          Your Recipe Collection
        </h1>
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
                <div className="flex items-center gap-2">
                  {cuisine === 'all' ? <ChefHat className="h-4 w-4" /> : getCuisineIcon(cuisine)}
                  {cuisine === 'all' ? 'All Cuisines' : cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                </div>
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
                <div className="flex items-center gap-2">
                  {diet === 'all' ? <Utensils className="h-4 w-4" /> : 
                   diet === 'vegetarian' ? <Salad className="h-4 w-4" /> :
                   diet === 'vegan' ? <Vegan className="h-4 w-4" /> :
                   diet === 'gluten-free' ? <Wheat className="h-4 w-4" /> : 
                   <Flame className="h-4 w-4" />}
                  {diet === 'all' ? 'All Diets' : diet.charAt(0).toUpperCase() + diet.slice(1)}
                </div>
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
            <Link href="/playground" className="gap-2">
              <Plus className="h-4 w-4" />
              Generate Recipe
            </Link>
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
              <TabsTrigger value="grid" className="gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Grid View
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                List View
              </TabsTrigger>
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
                  getCuisineIcon={getCuisineIcon}
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
                  getCuisineIcon={getCuisineIcon}
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
        <DialogTitle className="text-2xl flex items-center gap-2">
          {getCuisineIcon(currentRecipe.cuisine || 'default')}
          {currentRecipe.title}
        </DialogTitle>
        <DialogDescription>
          {'Delicious recipe created just for you'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center mb-4">
            {getCuisineIcon(currentRecipe.cuisine || 'default')}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-1 text-primary" />
              <p className="font-medium">{currentRecipe.prepTime} min</p>
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
                      {ingredient.quantity} {ingredient.unit || ''}
                    </span>
                  )}
                  {ingredient.name}
                  {ingredient.preparation && (
                    <span className="text-muted-foreground text-sm ml-1">({ingredient.preparation})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          
          <h3 className="font-semibold mb-2">Instructions</h3>
          <ol className="space-y-3">
            {Array.isArray(currentRecipe.instructions) ? (
              currentRecipe.instructions.map((instruction: any, index: number) => (
                <li key={index} className="flex">
                  <span className="font-medium min-w-[28px]">{instruction.step || index + 1}.</span>
                  <span>{instruction.detail || instruction}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground">No instructions available</li>
            )}
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
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Recipe
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recipe? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={executeDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Recipe Card Component
const RecipeCard = ({ 
  recipe, 
  onView, 
  onDelete,
  getCuisineIcon
}: { 
  recipe: any; 
  onView: () => void; 
  onDelete: () => void;
  getCuisineIcon: (cuisine: string) => JSX.Element;
}) => (
  <Card className="h-full flex flex-col transition-transform hover:scale-[1.02] hover:shadow-lg">
    <div className="bg-muted rounded-t-lg h-48 flex items-center justify-center">
      <div className="p-6 bg-background rounded-full">
        {getCuisineIcon(recipe.cuisine || 'default')}
      </div>
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
          <Badge variant="outline">
            {recipe.diet === 'vegetarian' ? <Salad className="h-4 w-4 mr-1" /> :
             recipe.diet === 'vegan' ? <Vegan className="h-4 w-4 mr-1" /> :
             recipe.diet === 'gluten-free' ? <Wheat className="h-4 w-4 mr-1" /> :
             <Flame className="h-4 w-4 mr-1" />}
            {recipe.diet}
          </Badge>
        )}
        {recipe.cuisine && (
          <Badge variant="outline">
            {getCuisineIcon(recipe.cuisine)}
            {recipe.cuisine}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {recipe.description || 'Delicious recipe created just for you'}
      </p>
    </CardContent>
    <CardFooter className="flex justify-between gap-2">
      <Button variant="outline" size="sm" onClick={onView} className="gap-2">
        <Eye className="h-4 w-4" />
        View
      </Button>
      <Button variant="destructive" size="sm" onClick={onDelete} className="gap-2">
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </CardFooter>
  </Card>
);

// Recipe List Item Component
const RecipeListItem = ({ 
  recipe, 
  onView, 
  onDelete,
  getCuisineIcon
}: { 
  recipe: any; 
  onView: () => void; 
  onDelete: () => void;
  getCuisineIcon: (cuisine: string) => JSX.Element;
}) => (
  <Card className="flex overflow-hidden hover:shadow-md transition-shadow">
    <div className="w-32 flex-shrink-0 hidden sm:flex items-center justify-center bg-muted">
      <div className="p-6 bg-background rounded-full">
        {getCuisineIcon(recipe.cuisine || 'default')}
      </div>
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
            <Badge variant="outline">
              {recipe.diet === 'vegetarian' ? <Salad className="h-4 w-4 mr-1" /> :
               recipe.diet === 'vegan' ? <Vegan className="h-4 w-4 mr-1" /> :
               recipe.diet === 'gluten-free' ? <Wheat className="h-4 w-4 mr-1" /> :
               <Flame className="h-4 w-4 mr-1" />}
              {recipe.diet}
            </Badge>
          )}
          {recipe.cuisine && (
            <Badge variant="outline">
              {getCuisineIcon(recipe.cuisine)}
              {recipe.cuisine}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {recipe.description || 'Delicious recipe created just for you'}
        </p>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={onView} className="gap-2">
          <Eye className="h-4 w-4" />
          View Details
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} className="gap-2">
          <Trash2 className="h-4 w-4" />
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