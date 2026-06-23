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
    title: "Portfolio v2.1",
    description:
      "Website portfolio personal dengan tema Nord, HeroScene parallax gunung berlapis, GSAP ScrollTrigger, dan chatbot digital twin.",
    tags: ["Next.js", "TypeScript", "GSAP", "Tailwind"],
    github: "https://github.com/yourusername/portfolio",
    demo: "https://gentakusuma.dev",
    featured: true,
  },
  {
    id: "design-system",
    title: "Nord Design System",
    description:
      "Komponen library dark-mode dengan palet Nord, aksesibel WCAG AA, dibangun dengan Storybook dan Tailwind.",
    tags: ["React", "TypeScript", "Tailwind", "Storybook"],
    github: "https://github.com/yourusername/nord-ds",
    featured: true,
  },
  {
    id: "ecommerce-dashboard",
    title: "E-Commerce Dashboard",
    description:
      "Dashboard admin full-stack dengan visualisasi data real-time, manajemen inventori, dan laporan penjualan.",
    tags: ["Next.js", "Node.js", "PostgreSQL", "Chart.js"],
    github: "https://github.com/yourusername/ecom-dash",
    demo: "https://demo.yourdomain.com",
  },
  {
    id: "chat-app",
    title: "Real-Time Chat App",
    description:
      "Aplikasi chat real-time dengan autentikasi JWT, room publik/privat, dan notifikasi push.",
    tags: ["React", "Node.js", "Socket.io", "MongoDB"],
    github: "https://github.com/yourusername/chat-app",
  },
  {
    id: "blog-platform",
    title: "Blog Platform MDX",
    description:
      "Platform blog minimalis dengan MDX, syntax highlighting, dan RSS feed. Dark mode otomatis.",
    tags: ["Next.js", "MDX", "TypeScript"],
    github: "https://github.com/yourusername/mdx-blog",
  },
  {
    id: "cli-tool",
    title: "Dev CLI Tool",
    description:
      "Perkakas CLI untuk scaffolding proyek Next.js dengan konfigurasi Tailwind, ESLint, dan Prettier otomatis.",
    tags: ["Node.js", "TypeScript", "CLI"],
    github: "https://github.com/yourusername/dev-cli",
  },
];

export const ALL_TAGS = Array.from(new Set(PROJECTS.flatMap((p) => p.tags))).sort();
