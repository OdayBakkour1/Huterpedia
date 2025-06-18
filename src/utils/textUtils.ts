
export const cleanHtmlContent = (text: string): string => {
    if (!text) return '';
    
    // Decode HTML entities
    const decodeHtmlEntities = (str: string) => {
      const entityMap: { [key: string]: string } = {
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' ',
        '&ldquo;': '"',
        '&rdquo;': '"',
        '&lsquo;': "'",
        '&rsquo;': "'",
        '&mdash;': '—',
        '&ndash;': '–',
        '&hellip;': '…'
      };
      
      return str.replace(/&[#\w]+;/g, (entity) => {
        return entityMap[entity] || entity;
      });
    };
    
    // Remove HTML tags and clean up
    let cleaned = text
      // Remove img tags completely (including incomplete ones)
      .replace(/<img[^>]*>/gi, '')
      .replace(/<img[^>]*$/gi, '')
      // Remove all other HTML tags including incomplete ones
      .replace(/<[^>]*>/g, ' ')
      .replace(/<[^>]*$/g, '')
      .replace(/^[^<]*>/g, '')
      // Remove incomplete HTML attributes
      .replace(/\s+src="[^"]*"?/gi, '')
      .replace(/\s+href="[^"]*"?/gi, '')
      .replace(/\s+class="[^"]*"?/gi, '')
      .replace(/\s+style="[^"]*"?/gi, '')
      // Remove broken image URLs and incomplete attributes
      .replace(/https?:\/\/[^\s<>"]*-\s*$/gi, '')
      .replace(/src="[^"]*$/gi, '')
      .replace(/href="[^"]*$/gi, '')
      // Remove multiple spaces with single space
      .replace(/\s+/g, ' ')
      // Remove line breaks
      .replace(/\n/g, ' ')
      .trim();
    
    // Decode HTML entities
    cleaned = decodeHtmlEntities(cleaned);
    
    // Final cleanup for any remaining artifacts
    cleaned = cleaned
      // Remove any remaining incomplete tags or attributes
      .replace(/[<>]/g, '')
      // Remove standalone attribute patterns
      .replace(/\b(src|href|class|style|id)=["'][^"']*["']?/gi, '')
      .replace(/\b(src|href|class|style|id)=[^\s]*/gi, '')
      // Clean up multiple spaces again
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  };
  
  export const truncateText = (text: string, maxLength: number = 300): string => {
    if (!text || text.length <= maxLength) return text;
    
    // Find the last complete sentence within the limit
    const truncated = text.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );
    
    if (lastSentenceEnd > maxLength * 0.7) {
      return truncated.substring(0, lastSentenceEnd + 1);
    }
    
    // If no sentence end found, cut at word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };
  
  export const isValidDescription = (description: string): boolean => {
    if (!description) return false;
    
    const cleaned = cleanHtmlContent(description);
    
    // Check if description is too short or contains mostly HTML artifacts
    if (cleaned.length < 20) return false;
    
    // Check if description contains mostly broken HTML or image sources
    const htmlArtifacts = /src=|href=|<[^>]*|img\s|style=|class=|https?:\/\/[^\s]*-\s*$/gi;
    const artifactMatches = cleaned.match(htmlArtifacts);
    
    // If more than 10% of the content is HTML artifacts, consider it invalid
    if (artifactMatches && artifactMatches.length > cleaned.length * 0.1) return false;
    
    return true;
  };
  
  // New function to clean and validate article data from the database
  export const cleanArticleData = (article: any) => {
    const cleanedTitle = cleanHtmlContent(article.title || '');
    const cleanedDescription = cleanHtmlContent(article.description || '');
    
    return {
      ...article,
      title: cleanedTitle || 'Untitled Article',
      description: isValidDescription(article.description) 
        ? cleanedDescription 
        : `This cybersecurity article from ${article.source} discusses important security developments. Click to read the full article for detailed information.`,
      needsAiDescription: !isValidDescription(article.description)
    };
  };
  