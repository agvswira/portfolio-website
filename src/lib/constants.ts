// =============================================
// Ganti placeholder sebelum deploy ke produksi
// =============================================

export const SITE = {
  name: "Agus Wira",
  url: "https://aguswira.dev",
  title: "Agus Wira — Tech Enthusiast",
  description:
    "Mahasiswa Informatika yang tertarik di bidang AI dan Data Science. Suka ngoprek, eksperimen, dan membangun hal baru.",
  ogImage: "/images/og.png",
};

export const PERSONAL = {
  name: "Agus Wira",
  role: "Tech Enthusiast",
  location: "Indonesia",
  bio: "Mahasiswa Informatika yang tertarik dengan AI dan Data Science. Suka ngoprek teknologi, membangun bot, dan mengeksplorasi cara kerja machine learning. Selalu penasaran sama hal baru dan senang belajar lewat eksperimen.",
  email: "agvswira@yourdomain.com",
  github: "https://github.com/agvswira",
  linkedin: "https://linkedin.com/in/yourusername",
  instagram: "https://instagram.com/yourusername",
  discord: "https://discord.gg/yourinvite",
};

export const NAV_ITEMS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
] as const;

export const SOCIAL_LINKS = [
  { label: "GitHub", href: PERSONAL.github, icon: "FiGithub" },
  { label: "LinkedIn", href: PERSONAL.linkedin, icon: "FiLinkedin" },
  { label: "Instagram", href: PERSONAL.instagram, icon: "FiInstagram" },
  { label: "Discord", href: PERSONAL.discord, icon: "FaDiscord" },
  { label: "Email", href: `mailto:${PERSONAL.email}`, icon: "FiMail" },
] as const;

export const HERO_STATS = [
  { value: 1, suffix: "+", label: "Tahun belajar" },
  { value: 2, suffix: "", label: "Proyek" },
] as const;

interface TimelineItem {
  year: string;
  title: string;
  place: string;
  desc: string;
}

export const TIMELINE: readonly TimelineItem[] = [
  {
    year: "2025 — Sekarang",
    title: "S1 Informatika",
    place: "Universitas Udayana",
    desc: "Mendalami dasar-dasar pemrograman, algoritma, dan struktur data. Tertarik pada bidang AI dan Data Science.",
  },
  {
    year: "2025 — Sekarang",
    title: "Anggota Aktif",
    place: "Himpunan Mahasiswa Informatika (HIMAIF) — Universitas Udayana",
    desc: "Aktif mengikuti kegiatan organisasi, workshop, dan kolaborasi antar mahasiswa di bidang teknologi.",
  },
];

export const CHATBOT_SYSTEM_PROMPT = `Kamu adalah asisten virtual dari ${PERSONAL.name}, seorang ${PERSONAL.role} berbasis di ${PERSONAL.location}.
Jawab pertanyaan pengunjung website tentang ${PERSONAL.name} dengan santai dan ramah, seperti ngobrol sama teman.
Gunakan bahasa Indonesia yang santai tapi tetap sopan. Boleh pakai sapaan informal seperti "aku", "kamu", dll.
Hanya bahas hal yang berkaitan dengan ${PERSONAL.name}: minat, proyek, pengalaman, atau cara menghubunginya.
Jangan membahas topik di luar itu. Kalau nggak tahu, bilang aja dengan jujur.`;
