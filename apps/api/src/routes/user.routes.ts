import { Router } from 'express';
import { 
  createUser,
  getUsers,
  getCurrentUser,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controllers';
import { validate } from '../middlewares/validate';
import { userInputSchema, userUpdateSchema } from '@schemas/user.schema';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';

const router = Router();

// Helper to wrap async route handlers
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply authentication to all routes
router.use((req, res, next) => authMiddleware(req as any, res, next));

// Current user profile (accessible to authenticated users)
router.get('/me', asyncHandler(getCurrentUser));

// Admin-only routes
router.use((req, res, next) => adminMiddleware(req as any, res, next));

// User management endpoints
router.post('/', validate(userInputSchema), asyncHandler(createUser));
router.get('/', asyncHandler(getUsers));
router.get('/:id', asyncHandler(getUserById));
router.put('/:id', validate(userUpdateSchema), asyncHandler(updateUser));
router.delete('/:id', asyncHandler(deleteUser));

export default router;