import { Shield, Bug, Database, Code, Skull, Lock, Mail, Users, Zap, Eye } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  articles: any[];
}

const categories = [
  { name: "All", icon: Shield },
  { name: "Threats", icon: Shield },
  { name: "Vulnerabilities", icon: Bug },
  { name: "Breaches", icon: Database },
  { name: "Tools", icon: Code },
  { name: "Malware", icon: Skull },
  { name: "Ransomware", icon: Lock },
  { name: "Phishing", icon: Mail },
  { name: "Social Engineering", icon: Users },
  { name: "Threat Actors Landscape", icon: Users },
  { name: "Zero Day", icon: Zap },
  { name: "APT", icon: Eye },
];

// Disabled CategoryFilter
export const CategoryFilter = () => null;
