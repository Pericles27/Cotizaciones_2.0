import { z } from 'zod';

try {
  process.loadEnvFile();
} catch {
  // no .env file — use process.env as-is (CI/production)
}

const corsOriginList = z
  .string()
  .default('http://localhost:5173')
  .transform((s) => s.split(',').map((v) => v.trim()).filter(Boolean))
  .pipe(
    z.array(
      z.string().refine(
        (v) => {
          try {
            const u = new URL(v);
            return u.protocol === 'https:' || u.hostname === 'localhost';
          } catch {
            return false;
          }
        },
        { message: 'Each CORS_ORIGIN entry must be a valid https:// URL or http://localhost' },
      ),
    ),
  );

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),

    IOL_USERNAME: z.string().optional(),
    IOL_PASSWORD: z.string().optional(),
    // Legacy aliases
    REACT_APP_API_MAIL: z.string().optional(),
    REACT_APP_API_PASS: z.string().optional(),

    CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(30),
    CORS_ORIGIN: corsOriginList,

    // Optional: when set, all data endpoints require X-API-Key header.
    API_KEY: z
      .string()
      .min(16, 'API_KEY must be at least 16 characters')
      .optional()
      .or(z.literal('').transform(() => undefined)),
  })
  .transform((parsed) => ({
    ...parsed,
    iol: {
      password: parsed.IOL_PASSWORD ?? parsed.REACT_APP_API_PASS ?? '',
      configured: Boolean(
        (parsed.IOL_USERNAME ?? parsed.REACT_APP_API_MAIL) &&
          (parsed.IOL_PASSWORD ?? parsed.REACT_APP_API_PASS),
      ),
    },
  }));

export type Env = z.infer<typeof EnvSchema>;

const result = EnvSchema.safeParse(process.env);
if (!result.success) {
  console.error('[env] Invalid environment variables:');
  for (const issue of result.error.issues) {
    console.error(`  • ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env: Env = result.data;

if (!env.iol.configured) {
  console.warn('[env] IOL credentials not set — /bonos and /acciones will return 503');
}
