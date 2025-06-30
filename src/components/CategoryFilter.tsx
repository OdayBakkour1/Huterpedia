import { Shield, Bug, Database, Code, Skull, Lock, Mail, Users, Zap, Eye, TrendingUp, AlertTriangle } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  categoryCounts: Record<string, number>;
}

// Map category names to icons and colors
const CATEGORY_META: Record<string, { icon: any; color: string }> = {
  "All": { icon: Shield, color: "text-slate-400" },
  "Threats": { icon: Shield, color: "text-red-400" },
  "Vulnerabilities": { icon: Bug, color: "text-orange-400" },
  "Breaches": { icon: Database, color: "text-purple-400" },
  "Analysis": { icon: TrendingUp, color: "text-blue-400" },
  "Updates": { icon: AlertTriangle, color: "text-green-400" },
  "APT": { icon: Skull, color: "text-pink-400" },
  "Ransomware": { icon: Lock, color: "text-rose-400" },
  "Phishing": { icon: Mail, color: "text-cyan-400" },
  "Malware": { icon: Bug, color: "text-yellow-400" },
  "Zero Day": { icon: Zap, color: "text-fuchsia-400" },
  "Social Engineering": { icon: Users, color: "text-amber-400" },
  "Tools": { icon: Code, color: "text-lime-400" },
  "CVE": { icon: Eye, color: "text-indigo-400" },
};

export const CategoryFilter = ({ selectedCategory, setSelectedCategory, categories, categoryCounts }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((categoryName) => {
        const meta = CATEGORY_META[categoryName] || { icon: Shield, color: "text-slate-400" };
        const Icon = meta.icon;
        const isSelected = selectedCategory === categoryName;
        const count = categoryName === "All" ? (categoryCounts["All"] ?? 0) : (categoryCounts[categoryName] ?? 0);
        return (
          <button
            key={categoryName}
            onClick={() => setSelectedCategory(categoryName)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm group ${
              isSelected
                ? "bg-cyan-500 text-white shadow-lg transform scale-105"
                : "bg-slate-800/50 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400/50 border border-transparent backdrop-blur-sm hover:transform hover:scale-105"
            }`}
          >
            <Icon className={`h-3 w-3 ${isSelected ? 'text-white' : meta.color} group-hover:text-cyan-300 transition-colors duration-200`} />
            <span className="font-medium">{categoryName}</span>
            <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
              isSelected 
                ? 'bg-white/20 text-white' 
                : 'bg-slate-700/50 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300'
            } transition-all duration-200`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};