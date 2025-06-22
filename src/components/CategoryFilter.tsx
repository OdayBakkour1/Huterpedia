import { Shield, Bug, Database, Code, Skull, Lock, Mail, Users, Zap, Eye, TrendingUp, AlertTriangle } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  articles: any[];
}

const categories = [
  { name: "All", icon: Shield, color: "text-slate-400" },
  { name: "Threats", icon: Shield, color: "text-red-400" },
  { name: "Vulnerabilities", icon: Bug, color: "text-orange-400" },
  { name: "Breaches", icon: Database, color: "text-purple-400" },
  { name: "Analysis", icon: TrendingUp, color: "text-blue-400" },
  { name: "Updates", icon: AlertTriangle, color: "text-green-400" },
  { name: "Threat Actors Landscape", icon: Users, color: "text-yellow-400" },
];

export const CategoryFilter = ({ selectedCategory, setSelectedCategory, articles }: CategoryFilterProps) => {
  // Count articles per category
  const categoryCounts = categories.reduce((acc, cat) => {
    if (cat.name === "All") {
      acc[cat.name] = articles.length;
    } else {
      acc[cat.name] = articles.filter(a => a.category === cat.name).length;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-wrap gap-2">
      {categories
        .filter(cat => cat.name === "All" || categoryCounts[cat.name] > 0)
        .map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.name;
          const count = categoryCounts[category.name];
          
          return (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm group ${
                isSelected
                  ? "bg-cyan-500 text-white shadow-lg transform scale-105"
                  : "bg-slate-800/50 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400/50 border border-transparent backdrop-blur-sm hover:transform hover:scale-105"
              }`}
            >
              <Icon className={`h-3 w-3 ${isSelected ? 'text-white' : category.color} group-hover:text-cyan-300 transition-colors duration-200`} />
              <span className="font-medium">{category.name}</span>
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