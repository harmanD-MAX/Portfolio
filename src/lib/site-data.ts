export const SECTION_IDS = {
  home: "home",
  about: "about",
  skills: "skills",
  experience: "experience",
  projects: "projects",
  contact: "contact",
} as const;

export const navLinks = [
  { href: `#${SECTION_IDS.about}`, label: "About" },
  { href: `#${SECTION_IDS.skills}`, label: "Skills" },
  { href: `#${SECTION_IDS.experience}`, label: "Experience" },
  { href: `#${SECTION_IDS.projects}`, label: "Projects" },
  { href: `#${SECTION_IDS.contact}`, label: "Contact" },
] as const;

export const profile = {
  name: "Harmanpreet Singh",
  tag: "harman_",
  title: "Backend Engineer · Java · C++ · Go · Python",
  tagline: "Engineer by Nature ... Student by Time",
  university: "University of Alberta",
  degree: "BSc Computer Science",
  location: "Edmonton, Canada",
  email: "harmanbofficial@gmail.com",
  github: "https://github.com/harmanD-MAX",
  linkedin: "https://www.linkedin.com/in/harmanp01",
  hindiQuote:
    "हारने का डर और जीतने की उम्मीद... इन दोनों के बीच जो एक टेंशन वाला वक़्त होता है ना... कमाल का होता है।",
};

export const skills = [
  {
    title: "Languages",
    items: ["Java", "C++", "Go", "Python", "TypeScript", "JavaScript", "SQL"],
  },
  {
    title: "Systems & data",
    items: [
      "Distributed systems",
      "REST APIs",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "MongoDB",
    ],
  },
  {
    title: "Cloud & DevOps",
    items: [
      "Kubernetes",
      "Docker",
      "AWS",
      "Azure",
      "Firebase",
      "Cloudflare",
      "CI/CD",
      "GitHub Actions",
      "Linux",
      "Git",
    ],
  },
  {
    title: "Frameworks & AI",
    items: [
      "Spring Boot",
      ".NET / ASP.NET Core",
      "Node.js",
      "Express",
      "React",
      "Next.js",
      "Android",
      "Gemini",
      "Spring AI",
      "LLMs",
      "Diffusion models",
    ],
  },
  {
    title: "Engineering practice",
    items: [
      "Code reviews",
      "Unit and E2E testing",
      "Debugging",
      "Agile/Scrum",
    ],
  },
] as const;

export type ExperienceEntry = {
  role: string;
  company: string;
  duration: string;
  bullets: string[];
  certLink?: string;
  certText?: string;
};

export const experiences: ExperienceEntry[] = [
  {
    role: "Open-Source Contributor",
    company: "Volcano-sh (CNCF)",
    duration: "Jan 2026 — Present",
    bullets: [
      "Contributing since early 2026 to learn how cloud-native infrastructure works at scale; multiple Go PRs merged.",
      "Contributing to Volcano-sh, a CNCF project for cloud-native batch scheduling and high-performance computing.",
      "Tracked down a Redis pipeline failure under LRU memory pressure that was silently aborting GC batches — root-caused to premature redis.Nil returns and shipped a regression test using miniredis (PR #281).",
      "Fixed container startup failures in non-default workspaces (PR #274).",
      "Refactored the E2E test structure to separate fixtures from examples across scheduling workflows (PR #795).",
    ],
  },
  {
    role: "Software Engineering Intern",
    company: "La Connexional",
    duration: "Jan 2026 — Apr 2026",
    bullets: [
      "Worked on the backend of UNTAPPED, a production platform used by 500+ people across Alberta.",
      "Worked across the full backend of a production web app — built and maintained API endpoints for authentication, password reset, profile management, payment tracking, and invoice workflows.",
      "Added backend event hooks, scheduled reminders, OAuth auth, and idempotent payment processing with tests covering key flows.",
      "Shipped end-to-end using Docker, Git, and CI/CD pipelines, supporting the final production release.",
    ],
    certLink:
      "https://certificates.laconnexional.com/en/verify/28092057714046?ref=email",
    certText: "View verified certificate",
  },
];

export type ProjectEntry = {
  name: string;
  kicker: string;
  description: string;
  href: string;
  stack: string[];
  image?: string;
  /** Show a "Book a demo" button that collects the visitor's email. */
  demo?: boolean;
  award?: {
    label: string;
    links: { label: string; href: string }[];
  };
};

export const projects: ProjectEntry[] = [
  {
    name: "GeoScope",
    kicker: "Location Intelligence Platform",
    description:
      "Analyzes commercial locations using Google Maps Platform APIs and mathematical scoring algorithms, calculating a comprehensive GeoScore evaluating foot traffic, safety, competition, and transit accessibility. 3D map visualizations and real-time hourly traffic trends.",
    href: "https://github.com/harmanD-MAX/GeoScope",
    image: "/assets/proj-geoscope.png",
    award: {
      label: "Awards",
      links: [
        {
          label: "GMP Hackathon 2025 Winner",
          href: "https://developers.google.com/profile/badges/events/gmp/hackathon/2025?u=110687617829643686175",
        },
        {
          label: "GMP Awards Nominee",
          href: "https://mapsplatform.google.com/awards/nominees/geoscope/",
        },
      ],
    },
    stack: [
      "Next.js 14",
      "TypeScript",
      "Google Maps API",
      "Three.js",
      "Tailwind CSS",
    ],
  },
  {
    name: "Lyra",
    kicker: "AI Vocal Studio",
    description:
      "Sing a take over any song and Lyra corrects pitch and timing, then renders it in your own trained voice using diffusion-based voice conversion. Every render exports studio stems and a MIDI file. Includes a Voice Lab for recording and training your voice, a Google sign-in \"My Songs\" library, and a Lite mode that auto-adjusts for low-RAM/low-disk machines.",
    href: "https://github.com/harmanD-MAX/Lyra",
    demo: true,
    image: "/assets/proj-lyra.png",
    stack: [
      "Python",
      "Seed-VC (Diffusion)",
      "RVC v2",
      "Whisper",
      "Firebase Auth",
      "Cloudflare D1",
      "Cloudflare R2",
    ],
  },
  {
    name: "ArenaNet",
    kicker: "Multiplayer Game Backend",
    description:
      "A C++20 backend built to plug straight into Unity or Godot — handles login, friends, parties, custom lobbies, and full matchmaking. Networking runs on Asio for async TCP with a lightweight custom protocol. PostgreSQL handles accounts, match history, and ELO rankings via window functions; Redis for online tokens.",
    href: "https://github.com/harmanD-MAX/ArenaNet",
    image: "/assets/proj-arenanet.png",
    stack: [
      "C++20",
      "Asio",
      "TCP/IP",
      "PostgreSQL",
      "Redis",
    ],
  },
  {
    name: "TripWise",
    kicker: "AI Travel Planner",
    description:
      "Give it a budget, destination, and travel style — it builds a full day-by-day itinerary. Route optimization uses a TSP algorithm over the OSRM API to minimize daily travel distance. AI budget predictions with local currency detection, an intelligence report that flags issues, and an in-app AI chat assistant.",
    href: "https://github.com/harmanD-MAX/TripWise",
    image: "/assets/proj-tripwise.png",
    stack: [
      "Spring Boot 3",
      "Next.js 16",
      "Spring AI",
      "PostgreSQL",
      "AWS",
      "OSRM",
      "Clerk",
    ],
  },
  {
    name: "Echo",
    kicker: "Music Streaming App",
    description:
      "A Spotify-inspired web music player that streams from YouTube's catalog — search any track, build custom playlists, like songs, and share collections with friends via generated share codes. Real-time canvas audio visualizer, Google sign-in, and Firestore-synced listening history across sessions.",
    href: "https://github.com/harmanD-MAX/Echo",
    image: "/assets/proj-echo.png",
    stack: [
      "React 18",
      "Tailwind CSS",
      "Firebase",
      "Framer Motion",
      "YouTube Data API",
      "ReactPlayer",
    ],
  },
  {
    name: "Blueprint",
    kicker: "AI Repository Analyzer",
    description:
      "Paste any GitHub repo URL and get back a full architectural breakdown — dependency graphs, technical debt audits, REST endpoint discovery across ASP.NET Core, Spring Boot, Express, Flask, and FastAPI. Clones with LibGit2Sharp, runs structure through Gemini, renders as an interactive Cytoscape.js graph.",
    href: "https://github.com/harmanD-MAX/Blueprint",
    image: "/assets/proj-blueprint.png",
    stack: [
      ".NET 10",
      "React 19",
      "Gemini AI",
      "Astra DB",
      "SignalR",
      "Hangfire",
    ],
  },
  {
    name: "Mood Tracker",
    kicker: "Android Social App (University Team Project)",
    description:
      "An Android application designed to track and manage emotional well-being, featuring mood logging with locations, a time machine view, interactive maps, and a social feed—powered by Firebase for real-time sync.",
    href: "https://github.com/cmput301-w25/project-team_16",
    image: "/assets/proj-cmput301.png",
    stack: ["Java", "Android Studio", "Firebase", "Google Maps API", "Spotify API"],
  },
];

export const moreProjectsUrl =
  "https://github.com/harmanD-MAX?tab=repositories";
