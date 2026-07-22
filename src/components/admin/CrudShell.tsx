"use client";

import { useActionState, useState, type ReactNode } from "react";
import { idle, type ActionState } from "@/lib/action-state";
import { FormMessage, SubmitButton } from "./Fields";

/**
 * Collapsible "add new" panel. Kept closed by default so the list of existing
 * items stays the focus of the page.
 */
export function AddPanel({
  label,
  action,
  children,
}: {
  label: string;
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: (errors: Record<string, string>) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(action, idle);

  return (
    <div className="bg-card mb-6 rounded-[var(--radius)] border border-[var(--hairline)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="hover:text-accent flex w-full items-center justify-between px-5 py-4 text-left text-[14px] font-medium transition-colors"
      >
        {label}
        <span className="text-muted text-lg leading-none">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <form action={formAction} className="space-y-4 border-t border-[var(--hairline)] p-5">
          {children(state.errors ?? {})}
          <FormMessage state={state} />
          <SubmitButton>Add</SubmitButton>
        </form>
      )}
    </div>
  );
}

/**
 * One existing record: summary line that expands into its edit form, with a
 * delete button that asks for confirmation first.
 */
export function EditRow({
  title,
  subtitle,
  saveAction,
  deleteAction,
  deleteId,
  children,
}: {
  title: string;
  subtitle?: string;
  saveAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  deleteAction: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  deleteId: number;
  children: (errors: Record<string, string>) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(saveAction, idle);

  return (
    <div className="bg-card rounded-[var(--radius)] border border-[var(--hairline)]">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-[14px] font-medium">{title}</p>
          {subtitle && <p className="text-muted mt-0.5 truncate text-[12px]">{subtitle}</p>}
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-muted hover:text-accent text-[13px] transition-colors"
          >
            {open ? "Close" : "Edit"}
          </button>
          <DeleteButton action={deleteAction} id={deleteId} />
        </div>
      </div>

      {open && (
        <form action={formAction} className="space-y-4 border-t border-[var(--hairline)] p-5">
          <input type="hidden" name="id" value={deleteId} />
          {children(state.errors ?? {})}
          <FormMessage state={state} />
          <SubmitButton>Save changes</SubmitButton>
        </form>
      )}
    </div>
  );
}

export function DeleteButton({
  action,
  id,
  label = "Delete",
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  id: number;
  label?: string;
}) {
  const [state, formAction] = useActionState(action, idle);
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-muted text-[13px] transition-colors hover:text-[#F0806B]"
      >
        {label}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-[13px] text-[#F0806B] transition-opacity hover:opacity-80"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-muted hover:text-text text-[13px] transition-colors"
      >
        Cancel
      </button>
      {state.message && !state.ok && (
        <span className="text-[12px] text-[#F0806B]">{state.message}</span>
      )}
    </form>
  );
}
