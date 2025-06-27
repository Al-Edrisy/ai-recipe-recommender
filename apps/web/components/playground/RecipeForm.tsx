import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

const DIET_TYPES = [
  { value: "none", label: "No restrictions" },
  { value: "balanced", label: "Balanced" },
  { value: "high-fiber", label: "High-Fiber" },
  { value: "high-protein", label: "High-Protein" },
  { value: "low-carb", label: "Low-Carb" },
  { value: "low-fat", label: "Low-Fat" },
  { value: "low-sodium", label: "Low-Sodium" },
];

const SPICE_LEVELS = [
  { value: "mild", label: "Mild" },
  { value: "medium", label: "Medium" },
  { value: "hot", label: "Hot" },
];

interface RecipeFormProps {
  form: any;
  onChange: (field: string, value: any) => void;
  onGenerate: () => void;
  loading: boolean;
}

export const RecipeForm = ({ form, onChange, onGenerate, loading }: RecipeFormProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <Label htmlFor="ingredients">Ingredients</Label>
        <Input
          id="ingredients"
          value={form.ingredients.join(', ')}
          onChange={(e) => 
            onChange("ingredients", 
              e.target.value.split(',')
                .map(i => i.trim())
                .filter(i => i)
            )
          }
          placeholder="Enter ingredients, separated by commas"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Separate ingredients with commas
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <Label htmlFor="servings">Servings</Label>
          <Input
            id="servings"
            type="number"
            value={form.servings}
            onChange={(e) =>
              onChange("servings", parseInt(e.target.value) || 1)
            }
            min="1"
          />
        </div>
        <div>
          <Label htmlFor="cookTime">Cook Time (min)</Label>
          <Input
            id="cookTime"
            type="number"
            value={form.cookTime}
            onChange={(e) =>
              onChange("cookTime", parseInt(e.target.value) || 0)
            }
            min="0"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="cuisine">Cuisine</Label>
        <Input
          id="cuisine"
          value={form.cuisine || ""}
          onChange={(e) => onChange("cuisine", e.target.value)}
          placeholder="e.g., Italian, Mexican, Libyan"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="diet">Diet Type</Label>
        <Select
          onValueChange={(value) => onChange("diet", value)}
          value={form.diet}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select diet type" />
          </SelectTrigger>
          <SelectContent>
            {DIET_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label>Preferences</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label htmlFor="spiceLevel">Spice Level</Label>
            <Select
              onValueChange={(value) =>
                onChange("preferences.spiceLevel", value)
              }
              value={form.preferences.spiceLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select spice level" />
              </SelectTrigger>
              <SelectContent>
                {SPICE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowFat"
                checked={form.preferences.lowFat}
                onCheckedChange={(checked) =>
                  onChange("preferences.lowFat", checked)
                }
              />
              <Label htmlFor="lowFat">Low Fat</Label>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button
          onClick={onGenerate}
          className="w-full"
          disabled={loading || !form.ingredients.length}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Recipe
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};