"use client";

import { useActionState, useState } from "react";
import type { Skill } from "@prisma/client";
import { deleteSkill, saveSkill, updateHeroSkills } from "@/actions/skills";
import { idle } from "@/lib/action-state";
import { cn } from "@/lib/utils";
import { AddPanel, EditRow } from "./CrudShell";
import { FormMessage, SubmitButton, TextField } from "./Fields";

const HERO_MAX = 8;

function SkillFields({
  errors,
  skill,
  categories,
}: {
  errors: Record<string, string>;
  skill?: Skill;
  categories: string[];
}) {
  return (
    <>
      <TextField
        label="Category"
        name="category"
        required
        defaultValue={skill?.category}
        error={errors.category}
        hint={
          categories.length > 0
            ? `Existing: ${categories.join(", ")}`
            : "e.g. Programming Languages"
        }
      />
      <TextField label="Skill" name="name" required defaultValue={skill?.name} error={errors.name} />
      <TextField
        label="Sort order"
        name="sortOrder"
        type="number"
        defaultValue={skill?.sortOrder ?? 0}
        error={errors.sortOrder}
        hint="Lower numbers come first. Categories are ordered by their lowest sort order."
      />
    </>
  );
}

/**
 * Bulk toggle for the hero's floating chips: tick any number of skills and save
 * them all with one button, instead of editing skills one at a time.
 */
function HeroChipsPanel({ skills }: { skills: Skill[] }) {
  const [state, formAction] = useActionState(updateHeroSkills, idle);
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(skills.filter((s) => s.heroHighlight).map((s) => s.id)),
  );

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const count = selected.size;

  return (
    <form
      action={formAction}
      className="bg-card mb-8 rounded-[var(--radius)] border border-[var(--hairline)] p-5"
    >
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[14px] font-medium">Hero chips</h2>
        <span
          className={cn(
            "text-[12px] tabular-nums",
            count > HERO_MAX ? "text-[#F0806B]" : "text-muted",
          )}
        >
          {count} selected{count > HERO_MAX ? ` · only first ${HERO_MAX} show` : ` · up to ${HERO_MAX} show`}
        </span>
      </div>
      <p className="text-muted mb-4 text-[12px] leading-relaxed">
        Pick which skills float in the hero, then save once. When more than {HERO_MAX} are picked,
        the first {HERO_MAX} by sort order appear.
      </p>

      {skills.length === 0 ? (
        <p className="text-muted text-[13px]">Add a skill below first.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => {
            const on = selected.has(skill.id);
            return (
              <label
                key={skill.id}
                className={cn(
                  "jelly cursor-pointer rounded-full border px-3 py-1.5 text-[13px] select-none",
                  on
                    ? "border-[var(--accent)] bg-[var(--accent)]/12 text-[var(--accent)]"
                    : "text-muted hover:text-text border-[var(--hairline-strong)]",
                )}
              >
                <input
                  type="checkbox"
                  name="heroSkillIds"
                  value={skill.id}
                  checked={on}
                  onChange={() => toggle(skill.id)}
                  className="sr-only"
                />
                {skill.name}
              </label>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <SubmitButton>Save hero chips</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function SkillsManager({ skills }: { skills: Skill[] }) {
  const categories = [...new Set(skills.map((s) => s.category))];

  const grouped = categories.map((category) => ({
    category,
    items: skills.filter((s) => s.category === category),
  }));

  return (
    <>
      <HeroChipsPanel skills={skills} />

      <AddPanel label="+ Add a skill" action={saveSkill}>
        {(errors) => <SkillFields errors={errors} categories={categories} />}
      </AddPanel>

      {skills.length === 0 ? (
        <p className="text-muted text-[14px]">No skills yet. Add your first one above.</p>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.category}>
              <h2 className="text-muted mb-3 text-[11px] tracking-[0.16em] uppercase">
                {group.category}
              </h2>
              <div className="space-y-2">
                {group.items.map((skill) => (
                  <EditRow
                    key={skill.id}
                    title={skill.name}
                    subtitle={`Sort order ${skill.sortOrder}${skill.heroHighlight ? " · In hero" : ""}`}
                    saveAction={saveSkill}
                    deleteAction={deleteSkill}
                    deleteId={skill.id}
                  >
                    {(errors) => (
                      <SkillFields errors={errors} skill={skill} categories={categories} />
                    )}
                  </EditRow>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
