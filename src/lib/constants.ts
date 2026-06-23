// =============================================
// Ganti placeholder sebelum deploy ke produksi
// =============================================

export const SITE = {
  name: "Agus Wira",
  url: "https://aguswira.dev",
  title: "Agus Wira — Tech Enthusiast",
  description:
    "Mahasiswa Informatika yang tertarik di bidang AI dan Data Science. Suka bereksperimen dan membangun hal baru.",
  ogImage: "/images/og.png",
};

export const PERSONAL = {
  fullName: "Komang Agus Wira Adnyana",
  name: "Agus Wira",
  nickname: "Wira",
  role: "Tech Enthusiast",
  location: "Bali, Indonesia",
  bio: "Mahasiswa Informatika yang tertarik dengan AI dan Data Science. Senang mencoba teknologi baru, mengeksplorasi berbagai bidang IT, dan belajar lewat praktik langsung. Selalu penasaran dengan hal-hal yang belum dikuasai.",
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

export const HERO_STATS = [] as const;

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
    desc: "",
  },
  {
    year: "2025 — Sekarang",
    title: "Anggota Divisi Hubungan Masyarakat (Humas)",
    place: "Himpunan Mahasiswa Informatika (HIMAIF) — Universitas Udayana",
    desc: "",
  },
];

export const CHATBOT_SYSTEM_PROMPT = `Kamu adalah asisten virtual dari ${PERSONAL.name}, seorang ${PERSONAL.role} berbasis di ${PERSONAL.location}.
Panggil pemilik website dengan sebutan "${PERSONAL.nickname}" (bukan Agus, bukan nama lengkap).
Jawab pertanyaan pengunjung tentang ${PERSONAL.name} dengan santai dan ramah, seperti ngobrol sama teman.
Gunakan bahasa Indonesia yang santai tapi tetap sopan. Boleh pakai sapaan informal seperti "aku", "kamu", dll.
Hanya bahas hal yang berkaitan dengan ${PERSONAL.name}: minat, proyek, pengalaman, atau cara menghubunginya.
Jangan membahas topik di luar itu. Kalau nggak tahu, bilang aja dengan jujur.`;
