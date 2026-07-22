"use client";

import { useActionState } from "react";
import { authenticate } from "@/actions/auth";
import { idle } from "@/lib/action-state";
import { FormMessage, SubmitButton, TextField } from "./Fields";

export function LoginForm() {
  const [state, formAction] = useActionState(authenticate, idle);

  return (
    <form action={formAction} className="space-y-4">
      <TextField label="Username" name="username" autoComplete="username" required />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />

      <FormMessage state={state} />

      <div className="pt-1">
        <SubmitButton>Sign in</SubmitButton>
      </div>
    </form>
  );
}
