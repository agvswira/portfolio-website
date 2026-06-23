// =============================================
// Ganti placeholder sebelum deploy ke produksi
// =============================================

export const SITE = {
  name: "Genta Kusuma",
  url: "https://gentakusuma.dev",
  title: "Genta Kusuma — Frontend Engineer",
  description:
    "Frontend Engineer berbasis di Indonesia. Membangun antarmuka web modern yang cepat, aksesibel, dan elegan.",
  ogImage: "/images/og.png",
};

export const PERSONAL = {
  name: "Agus Wira",
  role: "Frontend Engineer",
  location: "Indonesia",
  bio: "Saya frontend engineer yang fokus pada performa, aksesibilitas, dan pengalaman pengguna yang mulus. Senang bereksperimen dengan animasi scroll, sistem desain, dan teknik rendering modern.",
  email: "genta@yourdomain.com",
  github: "https://github.com/yourusername",
  linkedin: "https://linkedin.com/in/yourusername",
  instagram: "https://instagram.com/yourusername",
  discord: "https://discord.gg/yourinvite",
};

export const NAV_ITEMS = [
  { label: "Beranda", href: "#hero" },
  { label: "Tentang", href: "#about" },
  { label: "Keahlian", href: "#skills" },
  { label: "Proyek", href: "#projects" },
  { label: "Blog", href: "#blog" },
  { label: "Kontak", href: "#contact" },
] as const;

export const SOCIAL_LINKS = [
  { label: "GitHub", href: PERSONAL.github, icon: "FiGithub" },
  { label: "LinkedIn", href: PERSONAL.linkedin, icon: "FiLinkedin" },
  { label: "Instagram", href: PERSONAL.instagram, icon: "FiInstagram" },
  { label: "Discord", href: PERSONAL.discord, icon: "FaDiscord" },
  { label: "Email", href: `mailto:${PERSONAL.email}`, icon: "FiMail" },
] as const;

export const HERO_STATS = [
  { value: 3, suffix: "+", label: "Tahun pengalaman" },
  { value: 20, suffix: "+", label: "Proyek selesai" },
  { value: 10, suffix: "+", label: "Klien puas" },
] as const;

export const TIMELINE = [
  {
    year: "2024",
    title: "Senior Frontend Engineer",
    place: "Startup Fintech",
    desc: "Memimpin migrasi ke Next.js App Router, meningkatkan LCP 40%.",
  },
  {
    year: "2023",
    title: "Frontend Engineer",
    place: "Agensi Digital",
    desc: "Membangun komponen library internal dengan Storybook & Tailwind.",
  },
  {
    year: "2022",
    title: "Junior Web Developer",
    place: "Freelance",
    desc: "Membuat 10+ website klien, fokus performa dan SEO.",
  },
  {
    year: "2021",
    title: "Kuliah Informatika",
    place: "Universitas",
    desc: "Aktif di komunitas web developer kampus.",
  },
] as const;

export const CHATBOT_SYSTEM_PROMPT = `Kamu adalah digital twin dari ${PERSONAL.name}, seorang ${PERSONAL.role} berbasis di ${PERSONAL.location}.
Jawab pertanyaan pengunjung website tentang ${PERSONAL.name} dengan ramah dan jujur.
Hanya bahas hal yang berkaitan dengan ${PERSONAL.name}: keahlian, proyek, pengalaman, atau cara menghubunginya.
Jangan membahas topik di luar itu. Jawab dalam bahasa Indonesia secara ringkas dan profesional.
Jika ditanya sesuatu yang tidak kamu ketahui, katakan dengan jujur bahwa kamu tidak memiliki informasi tersebut.`;
