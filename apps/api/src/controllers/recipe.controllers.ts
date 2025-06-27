// src/controllers/recipe.controllers.ts
import { Request, Response, NextFunction } from 'express';
import { firestore, FieldValue } from '../config/firebase';
import {
  GenerateRecipeInputSchema,
  RecipeInputSchema,
  RecipeUpdateSchema,
  type GenerateRecipeInput,
  type RecipeInput,
  type RecipeUpdate,
  type Recipe as ZodRecipe,
} from '@schemas';
import { AuthenticatedRequest } from '../middlewares/auth';
import { generateRecipe as callLLM } from '../services/llm.service';
import { Timestamp as AdminTs } from 'firebase-admin/firestore';
import { Timestamp as ClientTs } from 'firebase/firestore';

const recipes = firestore.collection('recipes');

// ─── Helpers ─────────────────────────────────────────────────

/** Send an error and return `false` so callers can `if (!ok) return`. */
function respondError(
  res: Response,
  code: number,
  message: string
): false {
  res.status(code).json({ message });
  return false;
}



/** Fetches a document, or sends 404 and returns `undefined`. */
async function fetchDocOr404(
  id: string,
  res: Response
): Promise<FirebaseFirestore.DocumentSnapshot | undefined> {
  const doc = await recipes.doc(id).get();
  if (!doc.exists) {
    res.status(404).json({ message: 'Recipe not found' });
    return;
  }
  return doc;
}

/** Converts Firestore doc → your ZodRecipe interface */
function docToRecipe(doc: FirebaseFirestore.DocumentSnapshot): ZodRecipe {
  const d = doc.data() || {};
  // helper to normalize any timestamp
  const toDate = (v: any): Date =>
    v instanceof AdminTs
      ? v.toDate()
      : v instanceof ClientTs
        ? v.toDate()
        : new Date();

  return {
    id: doc.id,
    userId: d.userId,
    title: d.title,
    cuisine: d.cuisine,
    servings: d.servings,
    restrictions: d?.restrictions || [],
    dietType: d.dietType,
    lifestyle: d.lifestyle,
    ingredients: d?.ingredients || [],
    prepTime: d.prepTime,
    instructions: d.instructions,
    modelUsed: d.modelUsed,
    source: d.source,
    createdAt: toDate(d.createdAt),
    updatedAt: toDate(d.updatedAt),
  };
}

/** Ensure user is authenticated, or send 401 */
function requireUser(
  req: AuthenticatedRequest,
  res: Response
): string | undefined {
  const uid = req.user?.uid;
  if (!uid) respondError(res, 401, 'Unauthorized');
  return uid;
}

// ─── Controllers ───────────────────────────────────────────────

export const generateRecipeController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) auth
    const userId = requireUser(req, res);
    if (!userId) return;

    // 2) validate + parse
    const input = GenerateRecipeInputSchema.parse(req.body) as GenerateRecipeInput;

    // 3) generate & persist
    const payload = await callLLM(input, userId);
    const ref = await recipes.add({
      ...payload,
      userId,
      source: 'llm',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 4) respond
    const snap = await ref.get();
    res.status(201).json(docToRecipe(snap));
  } catch (err) {
    next(err);
  }
};

export const createRecipe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const data = RecipeInputSchema.parse(req.body) as RecipeInput;
    const ref = await recipes.add({
      ...data,
      userId,
      source: 'user',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const snap = await ref.get();
    res.status(201).json(docToRecipe(snap));
  } catch (err) {
    next(err);
  }
};

export const listPublicRecipes = async (
  req: Request,  // Public: no AuthenticatedRequest needed
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);

    const snapshot = await recipes
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    res.status(200).json(snapshot.docs.map(docToRecipe));
  } catch (err) {
    next(err);
  }
};


export const getRecipeById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      if (!respondError(res, 400, 'Recipe ID required')) return;
    }

    const doc = await fetchDocOr404(id, res);
    if (!doc) return;

    res.status(200).json(docToRecipe(doc));
  } catch (err) {
    next(err);
  }
};

export const updateRecipe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;
    
    if (!id || !userId) {
      res.status(400).json({ message: 'Recipe ID and user authentication required' });
      return;
    }

    // Validate input
    const recipeData = RecipeUpdateSchema.parse(req.body);
    
    // Check if recipe exists
    const doc = await recipes.doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ message: 'Recipe not found' });
      return;
    }

    // Verify ownership
    if (doc.data()?.userId !== userId) {
      res.status(403).json({ message: 'Forbidden: You can only update your own recipes' });
      return;
    }

    // Prepare update data (don't overwrite immutable fields)
    const updateData = {
      ...recipeData,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Perform update
    await recipes.doc(id).update(updateData);

    // Return updated recipe
    const updatedDoc = await recipes.doc(id).get();
    res.status(200).json(docToRecipe(updatedDoc));
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { id } = req.params;
    const doc = await fetchDocOr404(id, res);
    if (!doc) return;

    if (doc.data()?.userId !== userId) {
      if (!respondError(res, 403, 'Forbidden: not your recipe')) return;
    }

    await recipes.doc(id).delete();
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const listRecipes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const offset = Number(req.query.offset ?? 0);

    const snapshot = await recipes
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    res.status(200).json(snapshot.docs.map(docToRecipe));
  } catch (err) {
    next(err);
  }
};
