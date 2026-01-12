"use client";

import { usePlayground } from "@/hooks/usePlayground";
import { RecipeForm } from "@/components/playground/RecipeForm";
import { ChatPanel } from "@/components/playground/ChatPanel";
import { RecipeDisplay } from "@/components/playground/RecipeDisplay";
import { RecipeList } from "@/components/playground/RecipeList";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles, CookingPot, History, Plus, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {Recipe} from '@types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function PlaygroundPage() {
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();
  const isAuthenticated = !!firebaseUser;

  const {
    recipeForm,
    chatMessages,
    currentRecipe,
    savedRecipes,
    loading,
    error,
    handleFormChange,
    handleGenerateRecipe,
    handleSaveRecipe,
    handleDeleteRecipe,
    setCurrentRecipe,
    setChatMessages,
    loadRecipe,
  } = usePlayground();



  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isAIRecipeModalOpen, setIsAIRecipeModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 6;

  const paginatedRecipes = savedRecipes.slice(
    (currentPage - 1) * recipesPerPage,
    currentPage * recipesPerPage
  );

  const handleRecipeSelect = async (recipe) => {
    try {
      const loadedRecipe = await loadRecipe(recipe.id);
      setCurrentRecipe(loadedRecipe);
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Loaded recipe: ${loadedRecipe.title}`,
          createdAt: new Date(),
        },
      ]);
    } catch (err) {
      setError(`Failed to load recipe: ${err.message}`);
    }
  };

  const handleChatSubmit = async (message: string) => {
    if (message.startsWith("/")) {
      const command = message.substring(1).trim();
      
      // Search saved recipes
      if (command === "search" || command === "") {
        setChatMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Type '/search recipe-name' to find a recipe",
            createdAt: new Date(),
          },
        ]);
        return;
      }
      
      if (command.startsWith("search ")) {
        const recipeName = command.substring(7).trim();
        if (!recipeName) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "Please provide a recipe name to search",
              createdAt: new Date(),
            },
          ]);
          return;
        }
        
        const foundRecipes = savedRecipes.filter(recipe => 
          recipe.title.toLowerCase().includes(recipeName.toLowerCase())
        );
        
        if (foundRecipes.length === 0) {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `No recipes found matching "${recipeName}"`,
              createdAt: new Date(),
            },
          ]);
        } else if (foundRecipes.length === 1) {
          handleRecipeSelect(foundRecipes[0]);
        } else {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `Found ${foundRecipes.length} recipes:`,
              createdAt: new Date(),
            },
            ...foundRecipes.map(recipe => ({
              id: `recipe-${recipe.id}`,
              role: "assistant" as const,
              content: `- ${recipe.title} (${recipe.cuisine || 'No cuisine'}, ${recipe.prepTime} min)`,
              createdAt: new Date(),
            }))
          ]);
        }
        return;
      }
      
      // Load recipe by ID
      if (command.startsWith("load ")) {
        const recipeId = command.substring(5).trim();
        const recipe = savedRecipes.find(r => r.id === recipeId);
        
        if (recipe) {
          handleRecipeSelect(recipe);
        } else {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: `Recipe not found with ID: ${recipeId}`,
              createdAt: new Date(),
            },
          ]);
        }
        return;
      }
    }
    
    // Regular message handling
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: message,
        createdAt: new Date(),
      },
    ]);
    
    // Here you would typically add AI response logic
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary"
          />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        className="flex h-screen items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center max-w-md p-6 bg-background border rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-3 text-primary">
            Authentication Required
          </h2>
          <p className="text-muted-foreground mb-4">
            Please sign in to access the Recipe Playground
          </p>
          <Button onClick={() => router.push("/signin")}>Sign In</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 max-w-5xl"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive p-4 rounded-lg mb-6"
        >
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </motion.div>
      )}

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Recipe Playground</h1>
        <p className="text-muted-foreground mt-2">
          Experiment with AI-powered recipe creation and editing
        </p>
      </div>

      <Tabs defaultValue="playground" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="grid grid-cols-3 w-full max-w-sm">
            <TabsTrigger value="playground" className="flex gap-2">
              <Sparkles className="h-4 w-4" /> Playground
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex gap-2">
              <CookingPot className="h-4 w-4" /> My Recipes
            </TabsTrigger>
            <TabsTrigger value="history" className="flex gap-2">
              <History className="h-4 w-4" /> History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="playground">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Recipe Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RecipeForm
                    form={recipeForm}
                    onChange={handleFormChange}
                    onGenerate={handleGenerateRecipe}
                    loading={loading}
                  />
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CookingPot className="h-5 w-5" />
                    Saved Recipes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RecipeList
                    recipes={savedRecipes}
                    onSelect={handleRecipeSelect}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecipeDisplay
                recipe={currentRecipe}
                onSave={handleSaveRecipe}
                onDelete={handleDeleteRecipe}
                loading={loading}
              />

              <Card className="border-border/50 shadow-sm">
                <CardHeader>
                  <CardTitle>Chat Interface</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ChatPanel
                    messages={chatMessages}
                    onSubmit={handleChatSubmit}
                    loading={loading}
                    savedRecipes={savedRecipes}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recipes">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Recipe Collection</CardTitle>
                <Button
                  size="sm"
                  onClick={() => setIsAIRecipeModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Recipe
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {savedRecipes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                    <CookingPot className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    You haven't saved any recipes yet
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsAIRecipeModalOpen(true)}
                  >
                    Generate Your First Recipe
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedRecipes.map((recipe) => (
                      <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg">{recipe.title}</CardTitle>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {recipe.cuisine && (
                              <Badge variant="secondary" className="text-xs">
                                {recipe.cuisine}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {recipe.prepTime} min
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedRecipe(recipe);
                              setIsRecipeModalOpen(true);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRecipeSelect(recipe)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteRecipe(recipe.id)}
                          >
                            Delete
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        />
                        {[...Array(Math.ceil(savedRecipes.length / recipesPerPage))].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              isActive={currentPage === i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((p) =>
                              Math.min(
                                Math.ceil(savedRecipes.length / recipesPerPage),
                                p + 1
                              )
                            )
                          }
                          disabled={
                            currentPage === Math.ceil(savedRecipes.length / recipesPerPage)
                          }
                        />
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedRecipe && (
        <Dialog open={isRecipeModalOpen} onOpenChange={setIsRecipeModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedRecipe.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Ingredients</h3>
                <ul className="space-y-1">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex">
                      <span className="mr-2">•</span>
                      <span>
                        {typeof ing === 'string' ? ing : `${ing.name} - ${ing.quantity} ${ing.preparation ? `(${ing.preparation})` : ''}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Instructions</h3>
                <ol className="space-y-2">
                  {selectedRecipe.instructions.map((instruction, i) => {
                    const stepText = typeof instruction === 'string' 
                      ? instruction 
                      : instruction.detail || `Step ${instruction.step}`;
                    return (
                      <li key={i}>
                        <span className="font-bold mr-2">{i + 1}.</span>
                        <span>{stepText}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={isAIRecipeModalOpen} onOpenChange={setIsAIRecipeModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Recipe with AI</DialogTitle>
          </DialogHeader>
          <RecipeForm
            form={recipeForm}
            onChange={handleFormChange}
            onGenerate={() => {
              handleGenerateRecipe();
              setIsAIRecipeModalOpen(false);
            }}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}