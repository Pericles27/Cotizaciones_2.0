import { z } from 'zod';

/**
 * Carga apps/api/.env usando el loader nativo de Node 20.12+.
 * Envuelto en try/catch porque tira si no existe el archivo (válido en CI/prod
 * donde las env vars vienen del entorno real).
 */
try {
  process.loadEnvFile();
} catch {
  // no hay .env local — usamos lo que ya esté en process.env
}

/**
 * Schema de variables de entorno.
 * IOL_USERNAME / IOL_PASSWORD son opcionales: si faltan, la API arranca igual
 * pero las rutas que dependen de IOL responden 503.
 *
 * También acepta los nombres del proyecto legacy (REACT_APP_API_MAIL/PASS).
 */
const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),

    IOL_USERNAME: z.string().optional(),
    IOL_PASSWORD: z.string().optional(),
    REACT_APP_API_MAIL: z.string().optional(),
    REACT_APP_API_PASS: z.string().optional(),

    CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(30),
    CORS_ORIGIN: z
      .string()
      .default('http://localhost:5173')
      .transform((s) => s.split(',').map((v) => v.trim())),
  })
  .transform((parsed) => ({
    ...parsed,
    iol: {
      username: parsed.IOL_USERNAME ?? parsed.REACT_APP_API_MAIL ?? '',
      password: parsed.IOL_PASSWORD ?? parsed.REACT_APP_API_PASS ?? '',
      configured: Boolean(
        (parsed.IOL_USERNAME ?? parsed.REACT_APP_API_MAIL) &&
          (parsed.IOL_PASSWORD ?? parsed.REACT_APP_API_PASS),
      ),
    },
  }));

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = EnvSchema.parse(process.env);

if (!env.iol.configured) {
  console.warn(
    '[env] credenciales del proveedor no configuradas — ' +
      '/bonos y /acciones devolverán 503 hasta completar apps/api/.env',
  );
}
