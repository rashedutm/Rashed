"use client";

import { useActionState } from "react";
import { updateAccount } from "@/actions/account";
import { idle } from "@/lib/action-state";
import { FormMessage, SubmitButton, TextField } from "./Fields";

export function AccountForm({ username }: { username: string }) {
  const [state, formAction] = useActionState(updateAccount, idle);
  const err = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <TextField
        label="Username"
        name="username"
        required
        defaultValue={username}
        error={err.username}
        autoComplete="username"
      />

      <TextField
        label="Current password"
        name="currentPassword"
        type="password"
        required
        error={err.currentPassword}
        autoComplete="current-password"
        hint="Required to confirm any change."
      />

      <div className="border-t border-[var(--hairline)] pt-5">
        <p className="text-muted mb-4 text-[12px]">
          Leave both blank to keep your current password.
        </p>

        <div className="space-y-5">
          <TextField
            label="New password"
            name="newPassword"
            type="password"
            error={err.newPassword}
            autoComplete="new-password"
            hint="At least 8 characters."
          />
          <TextField
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            error={err.confirmPassword}
            autoComplete="new-password"
          />
        </div>
      </div>

      <FormMessage state={state} />

      <SubmitButton>Update account</SubmitButton>
    </form>
  );
}
