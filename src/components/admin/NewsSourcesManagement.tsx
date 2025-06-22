import { useState } from 'react';
import { useNewsSources, useAddNewsSource, useDeleteNewsSource } from '@/hooks/useAdminData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Rss, Plus, Trash2, RefreshCw, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BulkNewsSourceImport } from './BulkNewsSourceImport';
import { supabase } from '@/integrations/supabase/client';

export const NewsSourcesManagement = () => {
  const { data: sources, isLoading, refetch } = useNewsSources();
  const addSourceMutation = useAddNewsSource();
  const deleteSourceMutation = useDeleteNewsSource();
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);
  
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
    if (!confirm('Are you sure you want to delete this news source?')) return;
    
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

  const handleToggleActive = async (sourceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('news_sources')
        .update({ is_active: !currentStatus })
        .eq('id', sourceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `News source ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update news source status.",
        variant: "destructive",
      });
    }
  };

  const handleFetchNews = async (staging = false) => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { staging, maxArticles: 10 }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `News fetching completed. ${data?.summary?.totalNewArticles || 0} new articles added.`,
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleProcessStaging = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-staging-articles', {
        body: { batchSize: 50 }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Staging processing completed. ${data?.summary?.movedToProduction || 0} articles moved to production.`,
      });
    } catch (error) {
      console.error('Error processing staging:', error);
      toast({
        title: "Error",
        description: "Failed to process staging articles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const categories = ['Threats', 'Vulnerabilities', 'Analysis', 'Breaches', 'Updates', 'Threat Actors Landscape'];

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"} className={
      isActive 
        ? "bg-green-500/20 text-green-400 border-green-500/30" 
        : "bg-red-500/20 text-red-400 border-red-500/30"
    }>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Threats': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Vulnerabilities': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Breaches': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Analysis': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Updates': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Threat Actors Landscape': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    
    return (
      <Badge className={colors[category as keyof typeof colors] || 'bg-slate-500/20 text-slate-400'}>
        {category}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            News Fetching Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleFetchNews(true)}
              disabled={isFetching}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Fetch to Staging
            </Button>
            <Button
              onClick={() => handleFetchNews(false)}
              disabled={isFetching}
              className="bg-green-600 hover:bg-green-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Fetch to Production
            </Button>
            <Button
              onClick={handleProcessStaging}
              disabled={isFetching}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Play className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Process Staging
            </Button>
          </div>
          <p className="text-slate-400 text-sm mt-3">
            Use staging for testing new sources. Production adds articles directly to the live feed.
          </p>
        </CardContent>
      </Card>

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
                      <TableCell className="text-white font-medium">{source.name}</TableCell>
                      <TableCell className="text-slate-300 max-w-xs">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-cyan-400 truncate block"
                          title={source.url}
                        >
                          {source.url}
                        </a>
                      </TableCell>
                      <TableCell className="text-slate-300 capitalize">{source.type}</TableCell>
                      <TableCell>{getCategoryBadge(source.category)}</TableCell>
                      <TableCell>{getStatusBadge(source.is_active)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(source.id, source.is_active)}
                            className={`border-slate-600 text-slate-300 hover:text-white ${
                              source.is_active 
                                ? 'hover:bg-red-600 hover:border-red-600' 
                                : 'hover:bg-green-600 hover:border-green-600'
                            }`}
                          >
                            {source.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(source.id)}
                            disabled={deleteSourceMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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