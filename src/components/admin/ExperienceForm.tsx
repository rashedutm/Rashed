"use client";

import { useActionState } from "react";
import type { Experience, ExperienceBullet } from "@prisma/client";
import { saveExperience } from "@/actions/experience";
import { idle } from "@/lib/action-state";
import { CheckboxField, FormMessage, RepeatableList, SubmitButton, TextField } from "./Fields";

type ExperienceWithBullets = Experience & { bullets: ExperienceBullet[] };

export function ExperienceForm({
  experience,
  nextSortOrder = 0,
}: {
  experience?: ExperienceWithBullets;
  nextSortOrder?: number;
}) {
  const [state, formAction] = useActionState(saveExperience, idle);
  const err = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {experience && <input type="hidden" name="id" value={experience.id} />}

      <TextField
        label="Company"
        name="company"
        required
        defaultValue={experience?.company}
        error={err.company}
      />
      <TextField
        label="Role"
        name="role"
        required
        defaultValue={experience?.role}
        error={err.role}
      />
      <TextField
        label="Location"
        name="location"
        defaultValue={experience?.location}
        error={err.location}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Start date"
          name="startDate"
          required
          defaultValue={experience?.startDate}
          error={err.startDate}
          hint="e.g. Jun 2025"
        />
        <TextField
          label="End date"
          name="endDate"
          defaultValue={experience?.endDate}
          error={err.endDate}
          hint="Ignored if “current” is ticked."
        />
      </div>

      <CheckboxField
        label="I currently work here"
        name="current"
        defaultChecked={experience?.current}
        hint="Shows “Present” instead of an end date."
      />

      <RepeatableList
        name="bullets"
        label="Bullet points"
        multiline
        initial={experience?.bullets.map((b) => b.text) ?? []}
        placeholder="What you did and what it achieved…"
        hint="Blank rows are ignored. Order here is the order on the site."
      />

      <TextField
        label="Sort order"
        name="sortOrder"
        type="number"
        defaultValue={experience?.sortOrder ?? nextSortOrder}
        error={err.sortOrder}
        hint="Lower numbers appear first — usually most recent role at 0."
      />

      <FormMessage state={state} />

      <div className="sticky bottom-0 -mx-1 border-t border-[var(--hairline)] bg-[var(--base)]/90 px-1 py-4 backdrop-blur">
        <SubmitButton>{experience ? "Save changes" : "Create role"}</SubmitButton>
      </div>
    </form>
  );
}
