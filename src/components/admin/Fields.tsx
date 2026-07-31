"use client";

import { useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

/** Shared input styling, exported so one-off controls can match the rest. */
export const controlClass =
  "w-full rounded-[10px] border border-[var(--hairline-strong)] bg-elevated px-3.5 py-2.5 text-sm text-text placeholder:text-muted/60 transition-colors focus:border-[var(--accent)] focus:outline-none";

export function Field({
  label,
  name,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  name?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-[13px] font-medium">
        {label}
        {required && <span className="text-accent ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-muted text-[12px]">{hint}</p>}
      {error && <p className="text-[12px] text-[#F0806B]">{error}</p>}
    </div>
  );
}

export function TextField({
  label,
  name,
  defaultValue,
  error,
  hint,
  required,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  error?: string;
  hint?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <Field label={label} name={name} error={error} hint={hint} required={required}>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(controlClass, error && "border-[#F0806B]")}
      />
    </Field>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  error,
  hint,
  required,
  rows = 5,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  error?: string;
  hint?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <Field label={label} name={name} error={error} hint={hint} required={required}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        className={cn(controlClass, "resize-y leading-relaxed", error && "border-[#F0806B]")}
      />
    </Field>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  error,
  hint,
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  error?: string;
  hint?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Field label={label} name={name} error={error} hint={hint}>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={cn(controlClass, "appearance-none")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-elevated">
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="hover:bg-elevated/60 flex cursor-pointer items-start gap-3 rounded-[10px] border border-[var(--hairline)] px-3.5 py-3 transition-colors">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="accent-accent mt-0.5 h-4 w-4"
      />
      <span>
        <span className="block text-[13px] font-medium">{label}</span>
        {hint && <span className="text-muted block text-[12px]">{hint}</span>}
      </span>
    </label>
  );
}

/**
 * A list of text inputs the admin can grow and shrink — used for experience
 * bullets, tech chips and key features.
 */
export function RepeatableList({
  name,
  label,
  initial,
  placeholder,
  hint,
  multiline,
}: {
  name: string;
  label: string;
  initial: string[];
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
}) {
  const [rows, setRows] = useState<{ key: number; value: string }[]>(() =>
    (initial.length > 0 ? initial : [""]).map((value, i) => ({ key: i, value })),
  );
  const [nextKey, setNextKey] = useState(rows.length);

  const add = () => {
    setRows((prev) => [...prev, { key: nextKey, value: "" }]);
    setNextKey((k) => k + 1);
  };

  const remove = (key: number) =>
    setRows((prev) => (prev.length === 1 ? [{ key, value: "" }] : prev.filter((r) => r.key !== key)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium">{label}</span>
        <button
          type="button"
          onClick={add}
          className="text-accent hover:text-accent-hover text-[12px] transition-colors"
        >
          + Add
        </button>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="flex gap-2">
            {multiline ? (
              <textarea
                name={name}
                rows={2}
                defaultValue={row.value}
                placeholder={placeholder}
                className={cn(controlClass, "resize-y")}
              />
            ) : (
              <input
                name={name}
                type="text"
                defaultValue={row.value}
                placeholder={placeholder}
                className={controlClass}
              />
            )}
            <button
              type="button"
              onClick={() => remove(row.key)}
              aria-label="Remove item"
              className="text-muted shrink-0 rounded-[10px] border border-[var(--hairline)] px-3 transition-colors hover:border-[#F0806B] hover:text-[#F0806B]"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {hint && <p className="text-muted text-[12px]">{hint}</p>}
    </div>
  );
}

/** Paired URL + caption rows for a project's image gallery. */
export function GalleryList({
  initial,
}: {
  initial: { url: string; caption: string | null }[];
}) {
  const [rows, setRows] = useState(() =>
    (initial.length > 0 ? initial : [{ url: "", caption: "" }]).map((value, i) => ({
      key: i,
      ...value,
    })),
  );
  const [nextKey, setNextKey] = useState(rows.length);

  const add = () => {
    setRows((prev) => [...prev, { key: nextKey, url: "", caption: "" }]);
    setNextKey((k) => k + 1);
  };

  const remove = (key: number) =>
    setRows((prev) =>
      prev.length === 1 ? [{ key, url: "", caption: "" }] : prev.filter((r) => r.key !== key),
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium">Gallery images</span>
        <button
          type="button"
          onClick={add}
          className="text-accent hover:text-accent-hover text-[12px] transition-colors"
        >
          + Add image
        </button>
      </div>

      {rows.map((row) => (
        <div key={row.key} className="flex gap-2">
          <input
            name="galleryUrl"
            type="url"
            defaultValue={row.url}
            placeholder="https://res.cloudinary.com/…/image.jpg"
            className={cn(controlClass, "flex-[2]")}
          />
          <input
            name="galleryCaption"
            type="text"
            defaultValue={row.caption ?? ""}
            placeholder="Caption (optional)"
            className={cn(controlClass, "flex-1")}
          />
          <button
            type="button"
            onClick={() => remove(row.key)}
            aria-label="Remove image"
            className="text-muted shrink-0 rounded-[10px] border border-[var(--hairline)] px-3 transition-colors hover:border-[#F0806B] hover:text-[#F0806B]"
          >
            ×
          </button>
        </div>
      ))}

      <p className="text-muted text-[12px]">
        Paste image URLs (Cloudinary, Imgur, GitHub raw…). Nothing is uploaded to this app.
      </p>
    </div>
  );
}

export function SubmitButton({
  children = "Save",
  variant = "primary",
}: {
  children?: ReactNode;
  variant?: "primary" | "danger" | "ghost";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "jelly rounded-full px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-accent hover:bg-accent-hover text-[#1A0F06] hover:shadow-[0_10px_28px_-10px_var(--accent-glow)]",
        variant === "danger" &&
          "border border-[var(--hairline-strong)] text-[#F0806B] hover:border-[#F0806B]",
        variant === "ghost" &&
          "border border-[var(--hairline-strong)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
      )}
    >
      {pending ? "Working…" : children}
    </button>
  );
}

/** Success/error banner rendered from an action's returned state. */
export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;

  return (
    <div
      role="status"
      className={cn(
        "rounded-[10px] border px-4 py-3 text-[13px]",
        state.ok
          ? "border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]"
          : "border-[#F0806B]/40 bg-[#F0806B]/10 text-[#F0806B]",
      )}
    >
      {state.message}
    </div>
  );
}
