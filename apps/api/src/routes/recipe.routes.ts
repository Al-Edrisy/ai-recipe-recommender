import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middlewares/validate';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth';
import { 
  RecipeInputSchema, 
  RecipeUpdateSchema, 
  GenerateRecipeInputSchema 
} from '@schemas';
import * as ctrl from '../controllers/recipe.controllers';
import { listPublicRecipes } from '../controllers/recipe.controllers';

const router = Router();

// Generic async‐wrapper
const asyncHandler = (
  fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) =>
  fn(req as AuthenticatedRequest, res, next).catch(next);

// Normalize wrapped body payloads
const unwrapBody = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body?.body) req.body = req.body.body;
  next();
};


// ─── PUBLIC ROUTES ───────────────────────────────
router.get('/public', listPublicRecipes);


router.use(authMiddleware);
// ─── AUTHENTICATED ROUTES ─────────────────────────
router.use(authMiddleware);

// ─── AI Generation ────────────────────────────────
router.post(
  '/generate',
  unwrapBody,
  validate(GenerateRecipeInputSchema),
  asyncHandler(ctrl.generateRecipeController)
);

// ─── CRUD ─────────────────────────────────────────
router
  .route('/')
  .post(validate(RecipeInputSchema), asyncHandler(ctrl.createRecipe))
  .get(asyncHandler(ctrl.listRecipes));

router
  .route('/:id')
  .get(asyncHandler(ctrl.getRecipeById))
  .put(validate(RecipeUpdateSchema), asyncHandler(ctrl.updateRecipe))
  .delete(asyncHandler(ctrl.deleteRecipe));

export default router;
