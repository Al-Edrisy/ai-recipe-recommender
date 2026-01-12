import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Constants
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

// Props
interface RecipeFormProps {
  form: {
    ingredients: string[];
    servings: number;
    cookTime: number;
    cuisine: string;
    diet: string;
    preferences: {
      spiceLevel: string;
      lowFat: boolean;
    };
  };
  onChange: (field: string, value: any) => void;
  onGenerate: () => void;
  loading: boolean;
}

export const RecipeForm = ({ form, onChange, onGenerate, loading }: RecipeFormProps) => {
  const [buffer, setBuffer] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBuffer("");
  }, [form.ingredients]);

  const addIngredient = (raw: string) => {
    const cleaned = raw.trim().replace(/^"|"$/g, "");
    if (cleaned && !form.ingredients.includes(cleaned)) {
      onChange("ingredients", [...form.ingredients, cleaned]);
      setErrors((e) => ({ ...e, ingredients: false }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      if (buffer.trim()) {
        addIngredient(buffer);
        setBuffer("");
      }
    }
  };

  const removeIngredient = (index: number) => {
    const updated = form.ingredients.filter((_, i) => i !== index);
    onChange("ingredients", updated);
  };

  const validate = () => {
    const errs: Record<string, boolean> = {};
    if (form.ingredients.length === 0) errs.ingredients = true;
    if (!form.servings || form.servings < 1) errs.servings = true;
    return errs;
  };

  const handleGenerate = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
    } else {
      onGenerate();
    }
  };

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
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="show">
      {/* Ingredients Field */}
      <motion.div variants={itemVariants}>
        <Label htmlFor="ingredients" className="required">Ingredients</Label>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-2">
          {form.ingredients.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center bg-muted text-sm px-3 py-1 rounded-full"
            >
              {item}
              <button
                type="button"
                className="ml-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeIngredient(idx)}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input */}
        <Input
          id="ingredients"
          ref={inputRef}
          value={buffer}
          onChange={(e) => setBuffer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Type and press "," or Enter to add'
          className={errors.ingredients ? "border-destructive" : ""}
        />
        {errors.ingredients && (
          <p className="text-xs text-destructive mt-1">
            Please enter at least one ingredient.
          </p>
        )}
      </motion.div>

      {/* Servings and Cook Time */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="servings" className="required">Servings</Label>
          <Input
            id="servings"
            type="number"
            value={form.servings}
            onChange={(e) => {
              const value = Math.max(1, parseInt(e.target.value) || 1);
              onChange("servings", value);
              setErrors((prev) => ({ ...prev, servings: false }));
            }}
            min="1"
            className={errors.servings ? "border-destructive" : ""}
          />
          {errors.servings && (
            <p className="text-xs text-destructive mt-1">Servings must be at least 1</p>
          )}
        </div>
        <div>
          <Label htmlFor="cookTime">Cook Time (min)</Label>
          <Input
            id="cookTime"
            type="number"
            value={form.cookTime}
            onChange={(e) =>
              onChange("cookTime", Math.max(0, parseInt(e.target.value) || 0))
            }
            min="0"
          />
        </div>
      </motion.div>

      {/* Cuisine */}
      <motion.div variants={itemVariants}>
        <Label htmlFor="cuisine">Cuisine</Label>
        <Input
          id="cuisine"
          value={form.cuisine || ""}
          onChange={(e) => onChange("cuisine", e.target.value)}
          placeholder="e.g., Italian, Mexican, Libyan"
        />
      </motion.div>

      {/* Diet Type */}
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

      {/* Preferences */}
      <motion.div variants={itemVariants}>
        <Label>Preferences</Label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label htmlFor="spiceLevel">Spice Level</Label>
            <Select
              onValueChange={(value) => onChange("preferences.spiceLevel", value)}
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

      {/* Generate Button */}
      <motion.div variants={itemVariants}>
        <Button
          onClick={handleGenerate}
          className="w-full"
          disabled={loading}
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
