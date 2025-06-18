
import { Shield, Bug, Database, Code, Skull, Lock, Mail, Users, Zap, Eye } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
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
  { name: "Zero Day", icon: Zap },
  { name: "APT", icon: Eye },
];

export const CategoryFilter = ({ selectedCategory, setSelectedCategory }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.name;
        
        return (
          <button
            key={category.name}
            onClick={() => setSelectedCategory(category.name)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
              isSelected
                ? "bg-cyan-500 text-white shadow-lg"
                : "bg-slate-800/50 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400/50 border border-transparent backdrop-blur-sm"
            }`}
          >
            <Icon className="h-3 w-3" />
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
};
