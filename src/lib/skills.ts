export interface SkillItem {
  name: string;
  icon: string;
}

export interface SkillGroup {
  category: string;
  items: SkillItem[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: "Data Science",
    items: [
      { name: "Python", icon: "simple-icons:python" },
      { name: "Pandas", icon: "simple-icons:pandas" },
      { name: "Jupyter", icon: "simple-icons:jupyter" },
      { name: "TensorFlow", icon: "simple-icons:tensorflow" },
    ],
  },
  {
    category: "Frontend",
    items: [
      { name: "HTML", icon: "simple-icons:html5" },
      { name: "CSS", icon: "simple-icons:css" },
      { name: "JavaScript", icon: "simple-icons:javascript" },
    ],
  },
  {
    category: "Backend",
    items: [{ name: "Node.js", icon: "simple-icons:nodedotjs" }],
  },
  {
    category: "Database",
    items: [
      { name: "MySQL", icon: "simple-icons:mysql" },
      { name: "MongoDB", icon: "simple-icons:mongodb" },
    ],
  },
  {
    category: "Tools & DevOps",
    items: [
      { name: "Docker", icon: "simple-icons:docker" },
      { name: "Git", icon: "simple-icons:git" },
      { name: "Linux", icon: "simple-icons:linux" },
      { name: "Figma", icon: "simple-icons:figma" },
    ],
  },
  {
    category: "Soft Skills",
    items: [
      { name: "Problem Solving", icon: "lucide:brain" },
      { name: "Critical Thinking", icon: "lucide:lightbulb" },
      { name: "Time Management", icon: "lucide:target" },
      { name: "Teamwork", icon: "lucide:users" },
      { name: "English", icon: "lucide:languages" },
    ],
  },
];

export const TECH_MARQUEE = SKILL_GROUPS.flatMap((group) => group.items.slice(0, 3));
