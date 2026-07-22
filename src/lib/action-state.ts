/**
 * Shared shape for every `useActionState` form in the admin panel.
 *
 * This module is imported by client components, so it must stay free of
 * server-only imports (`next/cache`, Prisma, …). The server-side helpers that
 * build these values live in `action-utils.ts`.
 */
export type ActionState = {
  ok: boolean;
  message?: string;
  /** Field name → first error message, used to render inline form errors. */
  errors?: Record<string, string>;
};

export const idle: ActionState = { ok: false };
