
export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    source: string;
    publishedAt: string;
    category: string;
    url?: string;
    image_url?: string;
    cached_content_url?: string;
    cached_image_url?: string;
    cache_updated_at?: string;
  }
  