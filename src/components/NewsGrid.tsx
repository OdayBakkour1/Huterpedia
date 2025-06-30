import { NewsCard } from "./NewsCard";
import { NewsArticle } from "@/types/news";

interface NewsGridProps {
  articles: NewsArticle[];
}

export const NewsGrid = ({ articles }: NewsGridProps) => {
  console.log('[COMP] NewsGrid render, articles:', articles.length);
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-slate-400">No articles found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-8 px-2 md:px-0">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
};
