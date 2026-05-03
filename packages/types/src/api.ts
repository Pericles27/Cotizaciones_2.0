import { z } from 'zod';

/** Envoltura estándar de respuestas exitosas de la API. */
export const ApiOk = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    ok: z.literal(true),
    data: schema,
    cachedAt: z.string().datetime().optional(),
  });

/** Envoltura estándar de errores de la API. */
export const ApiError = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    cause: z.unknown().optional(),
  }),
});

export type ApiErrorPayload = z.infer<typeof ApiError>;

export type ApiResponse<T> =
  | { ok: true; data: T; cachedAt?: string }
  | ApiErrorPayload;
