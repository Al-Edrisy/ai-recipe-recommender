import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Utensils, Heart, Save, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface RecipeDisplayProps {
  recipe: any;
  onSave: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export const RecipeDisplay = ({ recipe, onSave, onDelete, loading }: RecipeDisplayProps) => {
  const formatIngredient = (ing: any) => {
    if (typeof ing === 'string') return ing;
    return `${ing.name}${ing.quantity ? ` - ${ing.quantity}` : ''}${
      ing.preparation ? ` (${ing.preparation})` : ''
    }`;
  };

  if (!recipe) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
        <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
          <Utensils className="h-8 w-8" />
        </div>
        <p className="text-center">No recipe selected</p>
        <p className="text-sm text-center text-muted-foreground mt-1">
          Generate a new recipe or select one from your saved recipes
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">{recipe.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-3">
                {recipe.cuisine && (
                  <Badge variant="secondary" className="gap-1">
                    <Utensils className="h-3 w-3" />
                    {recipe.cuisine}
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.prepTime} min
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {recipe.servings} servings
                </Badge>
                {recipe.dietType && recipe.dietType !== "none" && (
                  <Badge variant="outline" className="gap-1">
                    <Heart className="h-3 w-3" />
                    {recipe.dietType}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={onSave} 
                size="sm" 
                disabled={loading}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={loading}
                    className="gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(recipe.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete Recipe
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-lg">Ingredients</h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-2">
                {recipe.ingredients.map((ing: any, i: number) => (
                  <motion.li
                    key={i}
                    className="flex items-start"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="mr-2 text-primary">•</span>
                    <span>{formatIngredient(ing)}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-lg">Instructions</h3>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : (
              <ol className="space-y-3">
                {recipe.instructions.map((instruction: any, i: number) => {
                  const stepText = typeof instruction === 'string' 
                    ? instruction 
                    : instruction.detail || `Step ${instruction.step}`;
                  
                  return (
                    <motion.li
                      key={i}
                      className="flex"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <span className="font-bold mr-3">{i + 1}.</span>
                      <span>{stepText}</span>
                    </motion.li>
                  );
                })}
              </ol>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};