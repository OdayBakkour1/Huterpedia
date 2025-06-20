import { useState } from 'react';
import { useAddNewsArticle } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AddNewsSource = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    source: '',
    category: '',
    url: '',
    author: '',
  });
  const addArticleMutation = useAddNewsArticle();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.source || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addArticleMutation.mutateAsync(formData);
      toast({
        title: "Success",
        description: "News article has been added successfully.",
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        content: '',
        source: '',
        category: '',
        url: '',
        author: '',
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add news article.",
        variant: "destructive",
      });
    }
  };

  const categories = ['Threats', 'Vulnerabilities', 'Analysis', 'Breaches', 'Updates', 'Threat Actors Landscape'];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add News Article
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-slate-300">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Article title"
                required
              />
            </div>
            <div>
              <Label htmlFor="source" className="text-slate-300">Source *</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="News source"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-slate-300">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-slate-300">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="author" className="text-slate-300">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Article author"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="url" className="text-slate-300">URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="https://example.com/article"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Brief description of the article"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="content" className="text-slate-300">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Full article content"
              rows={6}
            />
          </div>

          <Button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600"
            disabled={addArticleMutation.isPending}
          >
            {addArticleMutation.isPending ? 'Adding...' : 'Add Article'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
