import { useState, useEffect } from "react";
import { useFeedPreferences } from "@/hooks/useFeedPreferences";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categories = [
  "Threats", 
  "Vulnerabilities", 
  "Breaches", 
  "Tools",
  "Malware",
  "Ransomware",
  "Phishing",
  "Social Engineering",
  "Zero Day",
  "APT"
];

export const FeedPreferences = () => {
  const { preferences, updatePreferences, isUpdating } = useFeedPreferences();
  const { toast } = useToast();

  // Fetch sources from database
  const { data: sources = [] } = useQuery({
    queryKey: ['newsSources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_sources')
        .select('name')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data.map(source => source.name);
    },
  });

  const [formData, setFormData] = useState({
    preferred_sources: [] as string[],
    preferred_categories: [] as string[],
    preferred_tags: [] as string[],
    date_range_days: 7,
    max_articles: 50,
    sort_preference: 'newest' as 'newest' | 'oldest' | 'relevance',
  });

  const [newTag, setNewTag] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    if (preferences) {
      setFormData({
        preferred_sources: preferences.preferred_sources || [],
        preferred_categories: preferences.preferred_categories || [],
        preferred_tags: preferences.preferred_tags || [],
        date_range_days: preferences.date_range_days || 7,
        max_articles: preferences.max_articles || 50,
        sort_preference: (preferences.sort_preference as 'newest' | 'oldest' | 'relevance') || 'newest',
      });
      setHasUserInteracted(true);
    }
  }, [preferences]);

  useEffect(() => {
    if (sources.length > 0 && formData.preferred_sources.length === 0 && !hasUserInteracted) {
      setFormData(prev => ({
        ...prev,
        preferred_sources: [...sources]
      }));
    }
  }, [sources, formData.preferred_sources.length, hasUserInteracted]);

  useEffect(() => {
    if (formData.preferred_categories.length === 0 && !hasUserInteracted) {
      setFormData(prev => ({
        ...prev,
        preferred_categories: [...categories]
      }));
    }
  }, [formData.preferred_categories.length, hasUserInteracted]);

  const handleSourceChange = (source: string, checked: boolean) => {
    setHasUserInteracted(true);
    setFormData(prev => ({
      ...prev,
      preferred_sources: checked
        ? [...prev.preferred_sources, source]
        : prev.preferred_sources.filter(s => s !== source)
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setHasUserInteracted(true);
    setFormData(prev => ({
      ...prev,
      preferred_categories: prev.preferred_categories.includes(category)
        ? prev.preferred_categories.filter(c => c !== category)
        : [...prev.preferred_categories, category]
    }));
  };

  const handleSelectAllSources = () => {
    setHasUserInteracted(true);
    setFormData(prev => ({
      ...prev,
      preferred_sources: [...sources]
    }));
  };

  const handleDeselectAllSources = () => {
    setHasUserInteracted(true);
    setFormData(prev => ({
      ...prev,
      preferred_sources: []
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.preferred_tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        preferred_tags: [...prev.preferred_tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_tags: prev.preferred_tags.filter(t => t !== tag)
    }));
  };

  const handleSave = () => {
    updatePreferences(formData);
    toast({
      title: "Preferences saved",
      description: "Your feed preferences have been updated successfully.",
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-white">Feed Preferences</CardTitle>
        <CardDescription className="text-slate-400">
          Customize your personalized news feed by selecting preferred sources, categories, and other settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sources */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-white">Preferred Sources</Label>
            <div className="flex gap-2">
              <Button
                onClick={handleSelectAllSources}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600 hover:border-cyan-500"
              >
                Select All
              </Button>
              <Button
                onClick={handleDeselectAllSources}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600 hover:border-red-500"
              >
                Deselect All
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            {sources.map(source => (
              <div key={source} className="flex items-center space-x-2">
                <Checkbox
                  id={`source-${source}`}
                  checked={formData.preferred_sources.includes(source)}
                  onCheckedChange={(checked) => handleSourceChange(source, checked as boolean)}
                  className="border-slate-500"
                />
                <Label
                  htmlFor={`source-${source}`}
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  {source}
                </Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {formData.preferred_sources.length} of {sources.length} sources selected
          </p>
        </div>

        {/* Categories */}
        <div>
          <Label className="text-white mb-3 block">Preferred Categories</Label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto bg-slate-700/30 p-4 rounded-lg border border-slate-600">
            {categories.map(category => (
              <Badge
                key={category}
                variant={formData.preferred_categories.includes(category) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  formData.preferred_categories.includes(category)
                    ? "bg-cyan-500 hover:bg-cyan-600"
                    : "border-slate-600 hover:border-cyan-500 text-slate-300"
                }`}
                onClick={() => handleCategoryToggle(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {formData.preferred_categories.length} of {categories.length} categories selected
          </p>
        </div>

        {/* Tags */}
        <div>
          <Label className="text-white mb-3 block">Custom Tags</Label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add custom tag..."
              className="bg-slate-700 border-slate-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <Button onClick={handleAddTag} size="sm">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.preferred_tags.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">
                {tag}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-white mb-2 block">Date Range (days)</Label>
            <Input
              type="number"
              value={formData.date_range_days}
              onChange={(e) => setFormData(prev => ({ ...prev, date_range_days: parseInt(e.target.value) || 7 }))}
              className="bg-slate-700 border-slate-600 text-white"
              min="1"
              max="30"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Max Articles</Label>
            <Input
              type="number"
              value={formData.max_articles}
              onChange={(e) => setFormData(prev => ({ ...prev, max_articles: parseInt(e.target.value) || 50 }))}
              className="bg-slate-700 border-slate-600 text-white"
              min="10"
              max="200"
            />
          </div>

          <div>
            <Label className="text-white mb-2 block">Sort By</Label>
            <Select
              value={formData.sort_preference}
              onValueChange={(value: 'newest' | 'oldest' | 'relevance') =>
                setFormData(prev => ({ ...prev, sort_preference: value }))
              }
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="relevance">Relevance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isUpdating}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            {isUpdating ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
