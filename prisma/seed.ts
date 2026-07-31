import { PrismaClient, ProjectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

/**
 * Content is only seeded into an empty database. Re-running the seed on a live
 * site therefore never destroys content you added through the admin panel.
 * Set SEED_FORCE=true to wipe and re-seed content anyway.
 */
const FORCE = process.env.SEED_FORCE === "true";

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await prisma.adminUser.upsert({
    where: { username: ADMIN_USERNAME },
    update: {},
    create: { username: ADMIN_USERNAME, passwordHash },
  });
  console.log(`✓ admin user ready → username: ${ADMIN_USERNAME}`);
}

async function wipeContent() {
  // Children first where cascade isn't relied on.
  await prisma.projectMedia.deleteMany();
  await prisma.projectTech.deleteMany();
  await prisma.projectFeature.deleteMany();
  await prisma.project.deleteMany();
  await prisma.experienceBullet.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.award.deleteMany();
  await prisma.education.deleteMany();
  await prisma.profile.deleteMany();
}

async function seedProfile() {
  await prisma.profile.create({
    data: {
      name: "MD Rashedur Rahman",
      headline: "Software Engineering student & builder",
      tagline: "I find real problems and build the software that fixes them.",
      bio: "Software Engineering undergraduate at Universiti Teknologi Malaysia. I build web apps, automation tools and robotics projects — from a WhatsApp bulk-messaging blaster used in production, to a lost-and-found platform, to line-following robots I designed the PCB for.",
      aboutMe:
        "Computer science student specializing in Software Engineering, passionate about identifying real-world problems and building innovative solutions, with interests and experience in robotics and cybersecurity (Blue Team and penetration testing). I aspire to build my own venture.",
      email: "rashed172700@gmail.com",
      phone: "+60 11-3962 5269",
      location: "Johor, Malaysia",
      githubUrl: "https://github.com/rashedutm",
      linkedinUrl: null,
      profileImageUrl: null,
      resumeUrl: null,
      heroVideoUrl: null,
      availability: "Seeking a non-academic internship starting February 2026",
    },
  });
  console.log("✓ profile");
}

async function seedSkills() {
  const groups: Record<string, string[]> = {
    "Programming Languages": ["C++", "JavaScript", "Java", "Assembly", "HTML", "CSS"],
    "RPA & Automation": ["UiPath"],
    "DevOps & CI/CD": ["Git", "GitHub Actions", "Vercel"],
    "Operating Systems": ["Linux (Kali)", "Linux (Ubuntu)", "macOS", "Windows"],
    "Spoken Languages": ["English", "Bengali", "Hindi", "Urdu"],
  };

  // A starter set of hero chips so a fresh install shows a varied cluster.
  const heroChips = new Set([
    "C++",
    "JavaScript",
    "UiPath",
    "Git",
    "GitHub Actions",
    "Linux (Kali)",
    "Linux (Ubuntu)",
    "English",
  ]);

  let categoryIndex = 0;
  for (const [category, names] of Object.entries(groups)) {
    await prisma.skill.createMany({
      data: names.map((name, i) => ({
        category,
        name,
        // Keep categories in a stable display order too.
        sortOrder: categoryIndex * 100 + i,
        heroHighlight: heroChips.has(name),
      })),
    });
    categoryIndex++;
  }
  console.log("✓ skills");
}

async function seedExperience() {
  const experiences = [
    {
      company: "Than Education Group Sdn Bhd",
      role: "Intern — Software Engineer & IT Support Management",
      location: "Petaling Jaya, Selangor",
      startDate: "Jun 2025",
      endDate: "Oct 2025",
      current: false,
      sortOrder: 0,
      bullets: [
        "Performed a vulnerability assessment of the company LMS and reported remediation steps.",
        "Designed course curricula for the ThED Code programme.",
        "Built and deployed a WhatsApp Message Blaster for bulk messaging used by the marketing team.",
        "Administered Microsoft 365 accounts, licences and access policies.",
        "Built a custom support chatbot to deflect repetitive IT support requests.",
      ],
    },
    {
      company: "International Institute of Public Policy and Management",
      role: "Web Developer, R&D",
      location: "Kuala Lumpur",
      startDate: "Nov 2024",
      endDate: "Mar 2025",
      current: false,
      sortOrder: 1,
      bullets: [
        "Ran a UI/UX analysis of the existing site and produced a full redesign.",
        "Implemented the redesign in HTML/CSS/JavaScript, integrated with the existing CMS.",
        "Wrote documentation enabling non-technical staff to manage content independently.",
      ],
    },
    {
      company: "Robocon",
      role: "Team Member — Robotics Development",
      location: "Johor Bahru",
      startDate: "Oct 2024",
      endDate: "Oct 2024",
      current: false,
      sortOrder: 2,
      bullets: [
        "Designed and soldered custom PCBs for the competition robot.",
        "Wrote robot-control software with sensor integration.",
        "Produced technical drawings and handled sensor calibration.",
        "Assembled and automated the final robot for autonomous operation.",
      ],
    },
  ];

  for (const { bullets, ...experience } of experiences) {
    await prisma.experience.create({
      data: {
        ...experience,
        bullets: {
          create: bullets.map((text, i) => ({ text, sortOrder: i })),
        },
      },
    });
  }
  console.log("✓ experience");
}

type SeedProject = {
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  description: string;
  role: string;
  tech: string[];
  features: string[];
  featured?: boolean;
  liveUrl?: string;
  repoUrl?: string;
};

async function seedProjects() {
  const projects: SeedProject[] = [
    {
      title: "WhatsApp Message Blaster",
      subtitle: "Bulk messaging automation shipped to a real marketing team",
      slug: "whatsapp-message-blaster",
      category: "Automation",
      description:
        "A desktop automation tool that sends personalised WhatsApp messages to a contact list loaded from a spreadsheet. Built during my internship at Than Education Group and deployed for the marketing team, replacing hours of manual copy-paste work with a single run.",
      role: "Sole developer — requirements, build and deployment",
      tech: ["Python", "Pandas", "Selenium", "PyAutoGUI"],
      features: [
        "Loads contacts and message templates from Excel/CSV via Pandas",
        "Per-contact personalisation with template placeholders",
        "Browser automation through Selenium with human-like pacing",
        "PyAutoGUI fallback for attachments the web client blocks",
        "Run summary reporting sent vs. failed recipients",
      ],
      featured: true,
    },
    {
      title: "Lostify",
      subtitle: "Lost-and-found platform for a university campus",
      slug: "lostify",
      category: "Web Apps",
      description:
        "A campus lost-and-found web app where students post items they have lost or found, browse listings, and get matched. Built with React and TypeScript on a Supabase backend, deployed on Vercel.",
      role: "Full-stack developer",
      tech: ["React", "TypeScript", "Supabase", "Vercel"],
      features: [
        "Post lost or found items with photos and location",
        "Search and filter listings by category, date and place",
        "Supabase auth so only the poster can edit or close a listing",
        "Responsive layout designed mobile-first for campus use",
      ],
      featured: true,
    },
    {
      title: "Socimoo",
      subtitle: "Social platform with an automated reporting bot",
      slug: "socimoo",
      category: "Web Apps",
      description:
        "A social web application backed by a SQL database, paired with a UiPath robot that compiles and distributes activity reports automatically — combining conventional web development with RPA.",
      role: "Developer — web app and RPA reporting pipeline",
      tech: ["React", "TypeScript", "JavaScript", "SQL", "UiPath"],
      features: [
        "User profiles, posts and interactions over a relational schema",
        "SQL reporting queries surfacing engagement metrics",
        "UiPath bot generating and emailing scheduled reports",
      ],
      featured: true,
    },
    {
      title: "INPUMA Website",
      subtitle: "UI/UX redesign for a public policy institute",
      slug: "inpuma-website",
      category: "Web Apps",
      description:
        "Full redesign of the International Institute of Public Policy and Management website. I ran the UI/UX analysis, designed the new interface, implemented it in HTML/CSS/JavaScript against the existing CMS, and documented the workflow so non-technical staff could maintain it.",
      role: "Web developer, R&D",
      tech: ["HTML", "CSS", "JavaScript", "CMS integration"],
      features: [
        "UI/UX audit of the legacy site with prioritised findings",
        "New responsive front end integrated with the existing CMS",
        "Handover documentation for non-technical content editors",
      ],
    },
    {
      title: "Amarcake",
      subtitle: "E-commerce storefront for a bakery",
      slug: "amarcake",
      category: "Web Apps",
      description:
        "An online cake shop with a product catalogue, cart and order flow. Front end in HTML/CSS/JavaScript with Supabase handling data and authentication.",
      role: "Full-stack developer",
      tech: ["HTML", "CSS", "JavaScript", "Supabase"],
      features: [
        "Product catalogue with categories and detail pages",
        "Cart and checkout flow persisted per user",
        "Supabase auth and order storage",
      ],
    },
    {
      title: "Portfolio Website",
      subtitle: "Client portfolio site, hand-built",
      slug: "portfolio-website",
      category: "Web Apps",
      description:
        "A portfolio website built for a client from scratch in HTML, CSS and JavaScript — no framework, no template — focused on fast load times and a clean, readable layout.",
      role: "Freelance developer",
      tech: ["HTML", "CSS", "JavaScript"],
      features: [
        "Hand-written responsive layout with no framework overhead",
        "Lightweight scroll and reveal animations",
        "Contact form wired to the client's inbox",
      ],
    },
    {
      title: "Space Shooter Game",
      subtitle: "2D arcade shooter in C++ with SDL2",
      slug: "space-shooter-game",
      category: "Games",
      description:
        "A 2D space shooter written in C++ using SDL2 — sprite rendering, collision detection, enemy waves and a scoring system, all built on a hand-rolled game loop.",
      role: "Sole developer",
      tech: ["C++", "SDL2"],
      features: [
        "Fixed-timestep game loop with sprite rendering",
        "AABB collision detection for bullets, enemies and the player",
        "Progressive enemy waves and score tracking",
      ],
    },
    {
      title: "Snake Game",
      subtitle: "Console Snake in C++",
      slug: "snake-game",
      category: "Games",
      description:
        "The classic Snake game implemented as a C++ console application — grid rendering in the terminal, real-time keyboard input, growth and self-collision logic.",
      role: "Sole developer",
      tech: ["C++"],
      features: [
        "Real-time non-blocking keyboard input in the console",
        "Grid-based rendering and growth mechanics",
        "Self- and wall-collision detection with score tracking",
      ],
    },
    {
      title: "Autocar",
      subtitle: "Line-following robot — PCB, firmware and assembly",
      slug: "autocar",
      category: "Robotics & Hardware",
      description:
        "An autonomous line-following robot built end to end: PCB design and soldering, motor and sensor wiring, control firmware, calibration and final assembly.",
      role: "Hardware and firmware developer",
      tech: ["PCB Design", "Embedded C", "Sensors", "Soldering"],
      features: [
        "Custom PCB designed and hand-soldered",
        "IR sensor array with calibration routine for varying light",
        "Control loop steering the motors to track the line autonomously",
      ],
    },
    {
      title: "Secure Lab Network System",
      subtitle: "Access-control logic built from discrete components",
      slug: "secure-lab-network-system",
      category: "Robotics & Hardware",
      description:
        "A digital-logic access control system for a lab network, designed with multiplexers, demultiplexers and flip-flops — a pure hardware design exercise in state machines and signal routing.",
      role: "Designer",
      tech: ["Digital Logic", "MUX/DeMUX", "Flip-Flops"],
      features: [
        "MUX/DeMUX routing for multiple access channels",
        "Flip-flop based state retention for lock status",
        "Truth tables and timing diagrams documenting the design",
      ],
    },
    {
      title: "Library Management System",
      subtitle: "Console CRUD system in C++",
      slug: "library-management-system",
      category: "Systems & Tools",
      description:
        "A C++ console application managing books, members and borrowing records, with file-backed persistence and a menu-driven interface.",
      role: "Sole developer",
      tech: ["C++", "File I/O"],
      features: [
        "Add, search, update and remove books and members",
        "Borrow and return flow with due-date tracking",
        "File-based persistence between sessions",
      ],
    },
  ];

  for (const [index, p] of projects.entries()) {
    const { tech, features, ...rest } = p;
    await prisma.project.create({
      data: {
        ...rest,
        status: ProjectStatus.published,
        sortOrder: index,
        tech: { create: tech.map((techName, i) => ({ techName, sortOrder: i })) },
        features: { create: features.map((text, i) => ({ text, sortOrder: i })) },
      },
    });
  }
  console.log(`✓ ${projects.length} projects`);
}

async function seedAwards() {
  await prisma.award.createMany({
    data: [
      {
        title: "CodeRush 25",
        result: "Second Runner-up",
        place: "Johor Bahru",
        date: "Jan 2025",
        sortOrder: 0,
      },
      {
        title: "Biology Olympiad — Open Category",
        result: "8th Prize",
        place: "Khulna, Bangladesh",
        date: "Feb 2023",
        sortOrder: 1,
      },
    ],
  });
  console.log("✓ awards");
}

async function seedEducation() {
  await prisma.education.createMany({
    data: [
      {
        institution: "Universiti Teknologi Malaysia",
        degree: "Bachelor of Software Engineering",
        location: "Johor, Malaysia",
        startDate: "Oct 2024",
        endDate: null,
        current: true,
        sortOrder: 0,
      },
      {
        institution: "Universiti Teknologi Malaysia",
        degree: "Foundation in Software Engineering",
        location: "Johor, Malaysia",
        startDate: "Feb 2024",
        endDate: "Aug 2024",
        current: false,
        sortOrder: 1,
      },
    ],
  });
  console.log("✓ education");
}

async function main() {
  await seedAdmin();

  const existing = await prisma.profile.count();
  if (existing > 0 && !FORCE) {
    console.log("• Content already exists — skipping content seed.");
    console.log("  (Run with SEED_FORCE=true to wipe and re-seed.)");
    return;
  }

  if (FORCE) {
    console.log("• SEED_FORCE=true — wiping existing content…");
    await wipeContent();
  }

  await seedProfile();
  await seedSkills();
  await seedExperience();
  await seedProjects();
  await seedAwards();
  await seedEducation();

  console.log("\nSeed complete. Log in at /admin/login");
  console.log(`  username: ${ADMIN_USERNAME}`);
  console.log(`  password: ${ADMIN_PASSWORD}  ← change this after first login`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
