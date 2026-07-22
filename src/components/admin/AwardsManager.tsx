"use client";

import type { Award } from "@prisma/client";
import { deleteAward, saveAward } from "@/actions/awards";
import { AddPanel, EditRow } from "./CrudShell";
import { TextField } from "./Fields";

function AwardFields({ errors, award }: { errors: Record<string, string>; award?: Award }) {
  return (
    <>
      <TextField
        label="Title"
        name="title"
        required
        defaultValue={award?.title}
        error={errors.title}
        hint="e.g. CodeRush 25"
      />
      <TextField
        label="Result / placement"
        name="result"
        defaultValue={award?.result}
        error={errors.result}
        hint="e.g. Second Runner-up"
      />
      <TextField
        label="Place"
        name="place"
        defaultValue={award?.place}
        error={errors.place}
        hint="e.g. Johor Bahru"
      />
      <TextField
        label="Date"
        name="date"
        defaultValue={award?.date}
        error={errors.date}
        hint="Free text, e.g. Jan 2025"
      />
      <TextField
        label="Sort order"
        name="sortOrder"
        type="number"
        defaultValue={award?.sortOrder ?? 0}
        error={errors.sortOrder}
      />
    </>
  );
}

export function AwardsManager({ awards }: { awards: Award[] }) {
  return (
    <>
      <AddPanel label="+ Add an award" action={saveAward}>
        {(errors) => <AwardFields errors={errors} />}
      </AddPanel>

      {awards.length === 0 ? (
        <p className="text-muted text-[14px]">No awards yet.</p>
      ) : (
        <div className="space-y-2">
          {awards.map((award) => (
            <EditRow
              key={award.id}
              title={award.title}
              subtitle={[award.result, award.place, award.date].filter(Boolean).join(" · ")}
              saveAction={saveAward}
              deleteAction={deleteAward}
              deleteId={award.id}
            >
              {(errors) => <AwardFields errors={errors} award={award} />}
            </EditRow>
          ))}
        </div>
      )}
    </>
  );
}
