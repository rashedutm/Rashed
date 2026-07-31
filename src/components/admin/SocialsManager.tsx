"use client";

import type { SocialLink } from "@prisma/client";
import { deleteSocialLink, saveSocialLink } from "@/actions/socials";
import { BrandIcon, getPlatform, PLATFORM_LIST } from "@/lib/socials";
import { AddPanel, EditRow } from "./CrudShell";
import { SelectField, TextField } from "./Fields";

const PLATFORM_OPTIONS = PLATFORM_LIST.map((p) => ({ value: p.key, label: p.label }));

function SocialFields({ errors, link }: { errors: Record<string, string>; link?: SocialLink }) {
  return (
    <>
      <SelectField
        label="Platform"
        name="platform"
        defaultValue={link?.platform ?? "github"}
        options={PLATFORM_OPTIONS}
        error={errors.platform}
        hint="Picks the logo shown next to the link."
      />
      <TextField
        label="Link or value"
        name="url"
        required
        defaultValue={link?.url}
        error={errors.url}
        hint="Full URL for social/website (https://…). For Email use the address, for Phone the number."
      />
      <TextField
        label="Label (optional)"
        name="label"
        defaultValue={link?.label}
        error={errors.label}
        hint="Overrides the default name (e.g. “Portfolio” instead of “Website”)."
      />
      <TextField
        label="Sort order"
        name="sortOrder"
        type="number"
        defaultValue={link?.sortOrder ?? 0}
        error={errors.sortOrder}
        hint="Lower numbers appear first."
      />
    </>
  );
}

export function SocialsManager({ links }: { links: SocialLink[] }) {
  return (
    <>
      <AddPanel label="+ Add a link" action={saveSocialLink}>
        {(errors) => <SocialFields errors={errors} />}
      </AddPanel>

      {links.length === 0 ? (
        <p className="text-muted text-[14px]">
          No links yet. Add GitHub, LinkedIn, a personal site, and anything else.
        </p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => {
            const platform = getPlatform(link.platform);
            return (
              <EditRow
                key={link.id}
                title={link.label || platform.label}
                subtitle={link.url}
                icon={
                  <span className="text-accent text-lg">
                    <BrandIcon platform={link.platform} />
                  </span>
                }
                saveAction={saveSocialLink}
                deleteAction={deleteSocialLink}
                deleteId={link.id}
              >
                {(errors) => <SocialFields errors={errors} link={link} />}
              </EditRow>
            );
          })}
        </div>
      )}
    </>
  );
}
