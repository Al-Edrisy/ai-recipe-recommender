// src/middlewares/validate.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject): RequestHandler =>
  async (req, res, next) => {
    try {
      const payload = req.body?.body ?? req.body;
      const result = await schema.parseAsync(payload);
      req.body = result;
      return next();               // <— always return void
    } catch (err) {
      if (err instanceof ZodError) {
        // no `return res...` here—just send and exit
        res.status(400).json({
          status: 'validation_error',
          errors: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          }))
        });
        return;                     // <— ensures void
      }
      return next(err);             // <— ensures void
    }
  };
