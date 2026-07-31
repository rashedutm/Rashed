"use client";

import { useActionState } from "react";
import type { Profile } from "@prisma/client";
import { saveProfile } from "@/actions/profile";
import { idle } from "@/lib/action-state";
import { FormMessage, SelectField, SubmitButton, TextArea, TextField } from "./Fields";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction] = useActionState(saveProfile, idle);
  const err = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-10">
      <fieldset className="space-y-5">
        <legend className="text-muted mb-4 text-[11px] tracking-[0.16em] uppercase">Identity</legend>

        <TextField
          label="Name"
          name="name"
          required
          defaultValue={profile?.name}
          error={err.name}
          hint="Shown as the logo and the hero headline."
        />
        <TextField
          label="Headline"
          name="headline"
          required
          defaultValue={profile?.headline}
          error={err.headline}
          hint="One line under your name, e.g. “Software Engineering student & builder”."
        />
        <TextField
          label="Tagline"
          name="tagline"
          required
          defaultValue={profile?.tagline}
          error={err.tagline}
          hint="A short intro sentence below the headline."
        />
        <TextField
          label="Availability"
          name="availability"
          defaultValue={profile?.availability}
          error={err.availability}
          hint="Shown as the pulsing pill above your name. Leave blank to hide it."
        />
        <SelectField
          label="Availability badge size"
          name="availabilitySize"
          defaultValue={profile?.availabilitySize ?? "md"}
          error={err.availabilitySize}
          hint="How large the availability pill appears."
          options={[
            { value: "sm", label: "Small" },
            { value: "md", label: "Medium" },
            { value: "lg", label: "Large" },
          ]}
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-muted mb-4 text-[11px] tracking-[0.16em] uppercase">About</legend>

        <TextArea
          label="About me"
          name="aboutMe"
          required
          rows={4}
          defaultValue={profile?.aboutMe}
          error={err.aboutMe}
          hint="The lead paragraph of the About section."
        />
        <TextArea
          label="Bio"
          name="bio"
          required
          rows={5}
          defaultValue={profile?.bio}
          error={err.bio}
          hint="A longer supporting paragraph."
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-muted mb-4 text-[11px] tracking-[0.16em] uppercase">Contact</legend>

        <TextField
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={profile?.email}
          error={err.email}
        />
        <TextField
          label="Phone"
          name="phone"
          required
          defaultValue={profile?.phone}
          error={err.phone}
        />
        <TextField
          label="Location"
          name="location"
          required
          defaultValue={profile?.location}
          error={err.location}
        />
        <p className="text-muted text-[12px] leading-relaxed">
          GitHub, LinkedIn, a personal site and other links are managed under{" "}
          <span className="text-accent">Contact &amp; Socials</span> — each shows its logo in the
          footer.
        </p>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-muted mb-4 text-[11px] tracking-[0.16em] uppercase">Media</legend>
        <p className="text-muted -mt-2 text-[12px] leading-relaxed">
          Paste URLs only — nothing is uploaded to this app. Cloudinary, Google Drive share links
          and YouTube links all work.
        </p>

        <TextField
          label="Profile image URL"
          name="profileImageUrl"
          type="url"
          defaultValue={profile?.profileImageUrl}
          error={err.profileImageUrl}
        />
        <TextField
          label="Résumé URL"
          name="resumeUrl"
          type="url"
          defaultValue={profile?.resumeUrl}
          error={err.resumeUrl}
          hint="Shown as the “Download Résumé” button. Leave blank to hide the button."
        />
        <TextField
          label="Hero video URL"
          name="heroVideoUrl"
          type="url"
          defaultValue={profile?.heroVideoUrl}
          error={err.heroVideoUrl}
          hint="Optional YouTube or .mp4 URL for the banner under the hero."
        />
      </fieldset>

      <FormMessage state={state} />

      <div className="sticky bottom-0 -mx-1 border-t border-[var(--hairline)] bg-[var(--base)]/90 px-1 py-4 backdrop-blur">
        <SubmitButton>Save profile</SubmitButton>
      </div>
    </form>
  );
}
