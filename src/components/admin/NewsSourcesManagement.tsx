
import { useState } from 'react';
import { useNewsSources, useAddNewsSource, useDeleteNewsSource } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rss, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BulkNewsSourceImport } from './BulkNewsSourceImport';

export const NewsSourcesManagement = () => {
  const { data: sources, isLoading } = useNewsSources();
  const addSourceMutation = useAddNewsSource();
  const deleteSourceMutation = useDeleteNewsSource();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'rss',
    category: 'Threats',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.url) {
      toast({
        title: "Error",
        description: "Name and URL are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addSourceMutation.mutateAsync(formData);
      toast({
        title: "Success",
        description: "News source has been added successfully.",
      });
      
      // Reset form
      setFormData({
        name: '',
        url: '',
        type: 'rss',
        category: 'Threats',
        isActive: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add news source.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (sourceId: string) => {
    try {
      await deleteSourceMutation.mutateAsync(sourceId);
      toast({
        title: "Success",
        description: "News source has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete news source.",
        variant: "destructive",
      });
    }
  };

  const categories = ['Threats', 'Vulnerabilities', 'Analysis', 'Breaches', 'Updates'];

  return (
    <div className="space-y-6">
      {/* Bulk Import Section */}
      <BulkNewsSourceImport />

      {/* Add Individual News Source Form */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Individual News Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-slate-300">Source Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Security News Site"
                  required
                />
              </div>
              <div>
                <Label htmlFor="url" className="text-slate-300">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="https://example.com/rss"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type" className="text-slate-300">Source Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="rss" className="text-slate-300">RSS Feed</SelectItem>
                    <SelectItem value="api" className="text-slate-300">API</SelectItem>
                    <SelectItem value="scraper" className="text-slate-300">Web Scraper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category" className="text-slate-300">Default Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
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
            </div>

            <Button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-600"
              disabled={addSourceMutation.isPending}
            >
              {addSourceMutation.isPending ? 'Adding...' : 'Add Source'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* News Sources List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Rss className="h-5 w-5" />
            News Sources ({sources?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-slate-400">Loading sources...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">URL</TableHead>
                    <TableHead className="text-slate-300">Type</TableHead>
                    <TableHead className="text-slate-300">Category</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sources?.map((source) => (
                    <TableRow key={source.id} className="border-slate-700">
                      <TableCell className="text-white">{source.name}</TableCell>
                      <TableCell className="text-slate-300 max-w-xs truncate">
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                          {source.url}
                        </a>
                      </TableCell>
                      <TableCell className="text-slate-300 capitalize">{source.type}</TableCell>
                      <TableCell className="text-slate-300">{source.category}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          source.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {source.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(source.id)}
                          disabled={deleteSourceMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!sources || sources.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                        No news sources found. Use the bulk import above to add cybersecurity sources.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
