import type {
  Award,
  Education,
  Experience,
  ExperienceBullet,
  Profile,
  SocialLink,
} from "@prisma/client";
import { Section } from "./Section";
import { FittedMedia } from "./FittedMedia";
import { formatDateRange, initials, safeUrl } from "@/lib/utils";
import { BrandIcon, getPlatform, socialHref } from "@/lib/socials";

export function About({ profile }: { profile: Profile }) {
  const image = safeUrl(profile.profileImageUrl);

  return (
    <Section id="about" eyebrow="About" title="Who I am" accent="#2fb6ab">
      <div className="grid gap-10 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-14">
        <div>
          <div className="bg-elevated relative aspect-square w-full max-w-[220px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--hairline)]">
            {image ? (
              <FittedMedia src={image} alt={profile.name} />
            ) : (
              <div className="from-accent-deep/25 flex h-full w-full items-center justify-center bg-gradient-to-br to-transparent">
                <span className="font-display text-accent/50 text-5xl">
                  {initials(profile.name)}
                </span>
              </div>
            )}
          </div>
          {profile.availability && (
            <p className="text-muted mt-4 max-w-[220px] text-[13px] leading-relaxed">
              <span className="text-accent">Available · </span>
              {profile.availability}
            </p>
          )}
        </div>

        <div className="space-y-5">
          <p className="text-lg leading-relaxed text-balance">{profile.aboutMe}</p>
          <p className="text-muted leading-relaxed">{profile.bio}</p>
        </div>
      </div>
    </Section>
  );
}

export function Skills({
  groups,
}: {
  groups: { category: string; items: { id: number; name: string }[] }[];
}) {
  if (groups.length === 0) return null;

  return (
    <Section id="skills" eyebrow="Toolkit" title="Skills" accent="#e8833a">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.category}>
            <h3 className="text-muted mb-3.5 text-[11px] tracking-[0.16em] uppercase">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((skill) => (
                <span
                  key={skill.id}
                  className="bg-card rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[13px] transition-colors duration-300 hover:border-[var(--accent)]"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

type ExperienceWithBullets = Experience & { bullets: ExperienceBullet[] };

export function ExperienceList({ items }: { items: ExperienceWithBullets[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="experience" eyebrow="Career" title="Experience" accent="#e6b24a">
      <div className="space-y-px">
        {items.map((item) => (
          <article
            key={item.id}
            className="hover:bg-elevated/40 grid gap-4 rounded-[var(--radius)] border-b border-[var(--hairline)] px-4 py-7 transition-colors duration-300 last:border-0 md:grid-cols-[minmax(0,200px)_minmax(0,1fr)] md:gap-10"
          >
            <div>
              <p className="text-accent text-[13px] tabular-nums">
                {formatDateRange(item.startDate, item.endDate, item.current)}
              </p>
              {item.location && <p className="text-muted mt-1 text-[13px]">{item.location}</p>}
            </div>

            <div>
              <h3 className="font-display text-lg tracking-tight">{item.role}</h3>
              <p className="text-muted mt-0.5 text-sm">{item.company}</p>
              {item.bullets.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {item.bullets.map((bullet) => (
                    <li key={bullet.id} className="text-muted flex gap-3 text-[14px] leading-relaxed">
                      <span className="bg-accent/60 mt-2 h-1 w-1 shrink-0 rounded-full" />
                      <span>{bullet.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Awards({ items }: { items: Award[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="awards" eyebrow="Recognition" title="Awards" accent="#ef6b52">
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((award) => (
          <article
            key={award.id}
            className="bg-card rounded-[var(--radius)] border border-[var(--hairline)] p-6 transition-colors duration-300 hover:border-[var(--hairline-strong)]"
          >
            {award.result && (
              <p className="text-accent mb-2 text-[11px] tracking-[0.16em] uppercase">
                {award.result}
              </p>
            )}
            <h3 className="font-display text-lg tracking-tight">{award.title}</h3>
            <p className="text-muted mt-2 text-[13px]">
              {[award.place, award.date].filter(Boolean).join(" · ")}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function EducationList({ items }: { items: Education[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="education" eyebrow="Background" title="Education" accent="#4aa8d8">
      <div className="space-y-px">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid gap-2 border-b border-[var(--hairline)] px-4 py-6 last:border-0 md:grid-cols-[minmax(0,200px)_minmax(0,1fr)] md:gap-10"
          >
            <p className="text-accent text-[13px] tabular-nums">
              {formatDateRange(item.startDate, item.endDate, item.current)}
            </p>
            <div>
              <h3 className="font-display text-lg tracking-tight">{item.degree}</h3>
              <p className="text-muted mt-0.5 text-sm">
                {[item.institution, item.location].filter(Boolean).join(" · ")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function SiteFooter({
  profile,
  socials = [],
}: {
  profile: Profile;
  socials?: SocialLink[];
}) {
  const links = socials
    .map((s) => ({ ...s, href: socialHref(s.platform, s.url) }))
    .filter((s) => s.href);

  return (
    <footer id="contact" className="mt-8 scroll-mt-24 border-t border-[var(--hairline)]">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <p
          className="mb-2 flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase"
          style={{ color: "var(--accent-2)" }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent-2)" }}
            aria-hidden="true"
          />
          Contact
        </p>
        <h2 className="font-display max-w-2xl text-[clamp(1.8rem,4.5vw,3rem)] leading-tight text-balance">
          Let&rsquo;s build something.
        </h2>

        <a
          href={`mailto:${profile.email}`}
          className="hover:bg-accent-2-hover mt-6 inline-block rounded-full px-6 py-3 text-sm font-medium text-[#04110F] transition-all duration-300"
          style={{ background: "var(--accent-2)" }}
        >
          Email me
        </a>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterItem label="Email">
            <a
              href={`mailto:${profile.email}`}
              className="hover:text-accent flex items-center gap-2.5 break-all transition-colors"
            >
              <BrandIcon platform="email" className="shrink-0 text-lg" />
              {profile.email}
            </a>
          </FooterItem>

          <FooterItem label="Phone">
            <a
              href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`}
              className="hover:text-accent flex items-center gap-2.5 transition-colors"
            >
              <BrandIcon platform="phone" className="shrink-0 text-lg" />
              {profile.phone}
            </a>
          </FooterItem>

          <FooterItem label="Elsewhere">
            {links.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.href as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent flex items-center gap-2.5 transition-colors"
                  >
                    <BrandIcon platform={link.platform} className="shrink-0 text-lg" />
                    {link.label || getPlatform(link.platform).label}
                  </a>
                ))}
              </div>
            ) : (
              <span className="text-muted">—</span>
            )}
          </FooterItem>

          <FooterItem label="Location">{profile.location}</FooterItem>
        </div>

        <div className="text-muted mt-16 border-t border-[var(--hairline)] pt-6 text-[12px]">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted mb-2 text-[11px] tracking-[0.16em] uppercase">{label}</p>
      <div className="text-[15px]">{children}</div>
    </div>
  );
}
