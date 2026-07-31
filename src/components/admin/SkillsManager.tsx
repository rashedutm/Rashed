"use client";

import type { Skill } from "@prisma/client";
import { deleteSkill, saveSkill } from "@/actions/skills";
import { AddPanel, EditRow } from "./CrudShell";
import { CheckboxField, TextField } from "./Fields";

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
      <TextField
        label="Skill"
        name="name"
        required
        defaultValue={skill?.name}
        error={errors.name}
      />
      <TextField
        label="Sort order"
        name="sortOrder"
        type="number"
        defaultValue={skill?.sortOrder ?? 0}
        error={errors.sortOrder}
        hint="Lower numbers come first. Categories are ordered by their lowest sort order."
      />
      <CheckboxField
        label="Show as a floating chip in the hero"
        name="heroHighlight"
        defaultChecked={skill?.heroHighlight}
        hint="The hero shows up to 8 of these, by sort order."
      />
    </>
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
