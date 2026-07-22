"use client";

import type { Education } from "@prisma/client";
import { deleteEducation, saveEducation } from "@/actions/education";
import { formatDateRange } from "@/lib/utils";
import { AddPanel, EditRow } from "./CrudShell";
import { CheckboxField, TextField } from "./Fields";

function EducationFields({
  errors,
  entry,
}: {
  errors: Record<string, string>;
  entry?: Education;
}) {
  return (
    <>
      <TextField
        label="Institution"
        name="institution"
        required
        defaultValue={entry?.institution}
        error={errors.institution}
      />
      <TextField
        label="Degree"
        name="degree"
        required
        defaultValue={entry?.degree}
        error={errors.degree}
      />
      <TextField
        label="Location"
        name="location"
        defaultValue={entry?.location}
        error={errors.location}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Start date"
          name="startDate"
          required
          defaultValue={entry?.startDate}
          error={errors.startDate}
          hint="e.g. Oct 2024"
        />
        <TextField
          label="End date"
          name="endDate"
          defaultValue={entry?.endDate}
          error={errors.endDate}
          hint="Ignored if “current” is ticked."
        />
      </div>
      <CheckboxField
        label="Currently studying here"
        name="current"
        defaultChecked={entry?.current}
        hint="Shows “Present” instead of an end date."
      />
      <TextField
        label="Sort order"
        name="sortOrder"
        type="number"
        defaultValue={entry?.sortOrder ?? 0}
        error={errors.sortOrder}
      />
    </>
  );
}

export function EducationManager({ entries }: { entries: Education[] }) {
  return (
    <>
      <AddPanel label="+ Add an education entry" action={saveEducation}>
        {(errors) => <EducationFields errors={errors} />}
      </AddPanel>

      {entries.length === 0 ? (
        <p className="text-muted text-[14px]">No education entries yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <EditRow
              key={entry.id}
              title={entry.degree}
              subtitle={`${entry.institution} · ${formatDateRange(entry.startDate, entry.endDate, entry.current)}`}
              saveAction={saveEducation}
              deleteAction={deleteEducation}
              deleteId={entry.id}
            >
              {(errors) => <EducationFields errors={errors} entry={entry} />}
            </EditRow>
          ))}
        </div>
      )}
    </>
  );
}
