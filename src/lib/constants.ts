// =============================================
// Ganti placeholder sebelum deploy ke produksi
// =============================================

export const SITE = {
  name: "Agus Wira",
  url: "https://aguswira.dev",
  title: "Mahasiswa Informatika yang eksplorasi AI & Data Science",
  description:
    "Portofolio eksperimen belajar di bidang AI, data science, dan web development.",
  ogImage: "/images/og.png",
};

export const PERSONAL = {
  name: "Agus Wira",
  role: "Tech Explorer",
  location: "Indonesia",
  bio: "Saya mahasiswa Informatika yang sedang belajar membuat antarmuka web yang menarik. Saat ini fokus mengeksplorasi AI, data science dasar, dan visualisasi data. Suka eksperimen dengan bot dan otomasi untuk produktivitas.",
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
  { value: 2, suffix: "", label: "Proyek eksperimen" },
  { value: 1, suffix: "+", label: "Kursus online" },
] as const;

interface TimelineItem {
  year: string;
  title: string;
  place: string;
  desc: string;
}

// Timeline disembunyikan sementara
export const TIMELINE = [] as readonly TimelineItem[];

export const CHATBOT_SYSTEM_PROMPT = `Kamu adalah digital twin dari ${PERSONAL.name}, seorang ${PERSONAL.role} berbasis di ${PERSONAL.location}.
Jawab pertanyaan pengunjung website tentang ${PERSONAL.name} dengan ramah dan jujur.
Hanya bahas hal yang berkaitan dengan ${PERSONAL.name}: keahlian, proyek, pengalaman, atau cara menghubunginya.
Jangan membahas topik di luar itu. Jawab dalam bahasa Indonesia secara ringkas dan profesional.
Jika ditanya sesuatu yang tidak kamu ketahui, katakan dengan jujur bahwa kamu tidak memiliki informasi tersebut.`;
