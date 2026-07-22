"use client";

import { useActionState, useState } from "react";
import type { Project, ProjectFeature, ProjectMedia, ProjectTech } from "@prisma/client";
import { saveProject } from "@/actions/projects";
import { idle } from "@/lib/action-state";
import { slugify } from "@/lib/validation";
import {
  CheckboxField,
  controlClass,
  FormMessage,
  GalleryList,
  RepeatableList,
  SelectField,
  SubmitButton,
  TextArea,
  TextField,
} from "./Fields";

type FullProject = Project & {
  tech: ProjectTech[];
  features: ProjectFeature[];
  media: ProjectMedia[];
};

export function ProjectForm({
  project,
  categories,
  nextSortOrder = 0,
}: {
  project?: FullProject;
  categories: string[];
  nextSortOrder?: number;
}) {
  const [state, formAction] = useActionState(saveProject, idle);
  const err = state.errors ?? {};

  // Keep the slug in sync with the title until the admin edits it by hand.
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  return (
    <form action={formAction} className="space-y-10">
      {project && <input type="hidden" name="id" value={project.id} />}

      <fieldset className="space-y-5">
        <legend className="text-muted mb-4 text-[11px] tracking-[0.16em] uppercase">Basics</legend>

        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-[13px] font-medium">
            Title <span className="text-accent ml-1">*</span>
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={controlClass}
          />
          {err.title && <p className="text-[12px] text-[#F0806B]">{err.title}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="slug" className="block text-[13px] font-medium">
            Slug <span className="text-accent ml-1">*</span>
          </label>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={controlClass}
          />
          <p className="text-muted text-[12px]">
            The public URL: /project/<span className="text-text">{slug || "…"}</span>. Generated from
            the title until you edit it yourself.
          </p>
          {err.slug && <p className="text-[12px] text-[#F0806B]">{err.slug}</p>}
        </div>

        <TextField
          label="Subtitle"
          name="subtitle"
          defaultValue={project?.subtitle}
          error={err.subtitle}
          hint="One line shown on the poster card and under the title."
        />

        <TextField
          label="Category"
          name="category"
          required
          defaultValue={project?.category}
          error={err.category}
          hint={
            categories.length > 0
              ? `This becomes a row on the home page. Existing: ${categories.join(", ")}`
              : "This becomes a row on the home page, e.g. Web Apps."
          }
        />

        <TextArea
          label="Description"
          name="description"
          required
          rows={6}
          defaultValue={project?.description}
          error={err.description}
          hint="Blank lines start a new paragraph."
        />

        <TextField
          label="My role"
          name="role"
          defaultValue={project?.role}
          error={err.role}
          hint="e.g. Full-stack developer"
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-muted mb-4 text-[11px] tracking-[0.16em] uppercase">
          Media &amp; links
        </legend>

        <TextField
          label="Thumbnail URL"
          name="thumbnailUrl"
          type="url"
          defaultValue={project?.thumbnailUrl}
          error={err.thumbnailUrl}
          hint="Poster image. Without one, a generated gradient card is used instead."
        />
        <TextField
          label="Video URL"
          name="videoUrl"
          type="url"
          defaultValue={project?.videoUrl}
          error={err.videoUrl}
          hint="YouTube link or a direct .mp4. Takes priority over the thumbnail on the detail page."
        />
        <TextField
          label="Live demo URL"
          name="liveUrl"
          type="url"
          defaultValue={project?.liveUrl}
          error={err.liveUrl}
          hint="The button only appears when this is filled in."
        />
        <TextField
          label="Repository URL"
          name="repoUrl"
          type="url"
          defaultValue={project?.repoUrl}
          error={err.repoUrl}
        />

        <GalleryList initial={project?.media.map((m) => ({ url: m.url, caption: m.caption })) ?? []} />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-muted mb-4 text-[11px] tracking-[0.16em] uppercase">Details</legend>

        <RepeatableList
          name="tech"
          label="Tech stack"
          initial={project?.tech.map((t) => t.techName) ?? []}
          placeholder="e.g. TypeScript"
          hint="Shown as chips on the card and detail page."
        />

        <RepeatableList
          name="features"
          label="Key features"
          multiline
          initial={project?.features.map((f) => f.text) ?? []}
          placeholder="What it does…"
        />
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="text-muted mb-4 text-[11px] tracking-[0.16em] uppercase">
          Visibility
        </legend>

        <SelectField
          label="Status"
          name="status"
          defaultValue={project?.status ?? "published"}
          options={[
            { value: "published", label: "Published — visible to everyone" },
            { value: "draft", label: "Draft — hidden from the public site" },
          ]}
        />

        <CheckboxField
          label="Featured"
          name="featured"
          defaultChecked={project?.featured}
          hint="Also appears in the “Featured” row at the top of the home page."
        />

        <TextField
          label="Sort order"
          name="sortOrder"
          type="number"
          defaultValue={project?.sortOrder ?? nextSortOrder}
          error={err.sortOrder}
          hint="Lower numbers come first within their row."
        />
      </fieldset>

      <FormMessage state={state} />

      <div className="sticky bottom-0 -mx-1 flex items-center gap-3 border-t border-[var(--hairline)] bg-[var(--base)]/90 px-1 py-4 backdrop-blur">
        <SubmitButton>{project ? "Save changes" : "Create project"}</SubmitButton>
        {project && (
          <a
            href={`/project/${project.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-accent text-[13px] transition-colors"
          >
            View on site ↗
          </a>
        )}
      </div>
    </form>
  );
}
