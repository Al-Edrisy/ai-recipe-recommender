import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Utensils, Heart, AlertCircle } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogCancel, AlertDialogFooter, AlertDialogDescription, AlertDialogHeader, AlertDialogAction, AlertDialogContent, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {Recipe} from '@types';

interface RecipeDisplayProps {
  recipe: Recipe | null;
  onSave: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export const RecipeDisplay = ({ recipe, onSave, onDelete, loading }: RecipeDisplayProps) => {
  if (!recipe) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No recipe selected
      </div>
    );
  }

  const formatIngredient = (ing: any) => {
    return `${ing.name}${ing.quantity ? ` - ${ing.quantity}` : ''}${
      ing.preparation ? ` (${ing.preparation})` : ''
    }`;
  };

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
                <Badge variant="secondary" className="gap-1">
                  <Utensils className="h-3 w-3" />
                  {recipe.cuisine}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.prepTime} min
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {recipe.servings} servings
                </Badge>
                {recipe.dietType !== "none" && (
                  <Badge variant="outline" className="gap-1">
                    <Heart className="h-3 w-3" />
                    {recipe.dietType}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onSave} size="sm" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={loading}>
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this recipe?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(recipe.id)}>
                      Delete
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
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
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
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-lg">Instructions</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((instruction, i) => (
                <motion.li
                  key={i}
                  className="flex"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="font-bold mr-3">{i + 1}.</span>a
                  <span>{instruction}</span>
                </motion.li>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};