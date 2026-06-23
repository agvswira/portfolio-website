export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
  thumbnail?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "portfolio",
    title: "Portfolio Website",
    description:
      "Website portfolio pribadi yang dibangun sebagai eksperimen belajar. Menggunakan Next.js 15 dengan animasi parallax GSAP, tema Nord yang minimalis, dan fitur chatbot interaktif. Proyek ini jadi ajang latihan bikin UI yang clean dan responsive.",
    tags: ["Next.js", "TypeScript", "GSAP", "Tailwind"],
    github: "https://github.com/agvswira/portfolio",
    demo: "https://aguswira.dev",
    featured: true,
  },
  {
    id: "eling-bot",
    title: "Eling — WhatsApp Reminder Bot",
    description:
      "Bot WhatsApp sederhana untuk reminder tugas kuliah. Dibangun pakai Node.js dan library Baileys. Bisa menerima perintah, menyimpan jadwal, dan ngirim notifikasi pengingat otomatis. Proyek belajar pertama di dunia automation dan chatbot.",
    tags: ["Node.js", "Baileys", "WhatsApp", "Bot"],
    github: "https://github.com/agvswira/eling-bot",
    featured: true,
  },
];

export const ALL_TAGS = Array.from(new Set(PROJECTS.flatMap((p) => p.tags))).sort();
