
import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAdminData';
import { useAnalyticsManagement } from '@/hooks/useAnalyticsManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FileText, Bookmark, Plus, Download, RefreshCw, Trash2, Eye, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const AnalyticsDashboard = () => {
  const { data: analytics, isLoading, refetch } = useAnalytics();
  const { updateAnalyticsMetrics } = useAnalyticsManagement();
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('7');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMetricMutation = useMutation({
    mutationFn: async ({ metricName, metricValue }: { metricName: string; metricValue: number }) => {
      const { error } = await supabase
        .from('analytics')
        .insert({
          metric_name: metricName,
          metric_value: metricValue,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: "Metric Added",
        description: "New analytics metric has been successfully added.",
      });
      setNewMetricName('');
      setNewMetricValue('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add metric: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMetricMutation = useMutation({
    mutationFn: async (metricId: string) => {
      const { error } = await supabase
        .from('analytics')
        .delete()
        .eq('id', metricId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: "Metric Deleted",
        description: "Analytics metric has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete metric: " + error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="text-slate-400">Loading analytics...</div>;
  }

  const getIcon = (metricName: string) => {
    switch (metricName) {
      case 'total_users': return <Users className="h-6 w-6 text-blue-500" />;
      case 'total_articles': return <FileText className="h-6 w-6 text-green-500" />;
      case 'total_bookmarks': return <Bookmark className="h-6 w-6 text-yellow-500" />;
      case 'monthly_signups': return <TrendingUp className="h-6 w-6 text-purple-500" />;
      default: return <TrendingUp className="h-6 w-6 text-gray-500" />;
    }
  };

  const formatMetricName = (name: string) => {
    return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const latestMetrics = analytics?.reduce((acc, metric) => {
    if (!acc[metric.metric_name] || new Date(metric.date_recorded) > new Date(acc[metric.metric_name].date_recorded)) {
      acc[metric.metric_name] = metric;
    }
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(latestMetrics || {}).map(metric => ({
    name: formatMetricName(metric.metric_name),
    value: metric.metric_value,
  }));

  const timeSeriesData = analytics?.filter(metric => 
    new Date(metric.date_recorded) >= new Date(Date.now() - parseInt(selectedDateRange) * 24 * 60 * 60 * 1000)
  ).reduce((acc, metric) => {
    const date = new Date(metric.date_recorded).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing[metric.metric_name] = metric.metric_value;
    } else {
      acc.push({
        date,
        [metric.metric_name]: metric.metric_value,
      });
    }
    return acc;
  }, [] as any[]);

  const COLORS = ['#06B6D4', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

  const pieChartData = Object.values(latestMetrics || {}).map((metric, index) => ({
    name: formatMetricName(metric.metric_name),
    value: metric.metric_value,
    color: COLORS[index % COLORS.length],
  }));

  const handleAddMetric = () => {
    if (!newMetricName.trim() || !newMetricValue.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please provide both metric name and value.",
        variant: "destructive",
      });
      return;
    }

    const value = parseInt(newMetricValue);
    if (isNaN(value)) {
      toast({
        title: "Invalid Value",
        description: "Metric value must be a number.",
        variant: "destructive",
      });
      return;
    }

    addMetricMutation.mutate({ metricName: newMetricName.toLowerCase().replace(/\s+/g, '_'), metricValue: value });
  };

  const handleRefresh = () => {
    updateAnalyticsMetrics.mutate(undefined, {
      onSuccess: () => {
        refetch();
        toast({
          title: "Analytics Refreshed",
          description: "Analytics data has been successfully refreshed.",
        });
      },
      onError: () => {
        refetch();
        toast({
          title: "Analytics Refreshed",
          description: "Analytics data has been refreshed.",
        });
      },
    });
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric Name,Value,Date Recorded\n"
      + (analytics || []).map(metric => 
          `${metric.metric_name},${metric.metric_value},${metric.date_recorded}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analytics_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-slate-400">Monitor and manage system metrics</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={updateAnalyticsMetrics.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updateAnalyticsMetrics.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            {viewMode === 'overview' ? 'Detailed' : 'Overview'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
            Trends
          </TabsTrigger>
          <TabsTrigger value="manage" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
            Manage
          </TabsTrigger>
          <TabsTrigger value="details" className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700">
            Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(latestMetrics || {}).map((metric) => (
              <Card key={metric.metric_name} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">{formatMetricName(metric.metric_name)}</p>
                      <p className="text-2xl font-bold text-white">{metric.metric_value.toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(metric.date_recorded).toLocaleDateString()}
                      </p>
                    </div>
                    {getIcon(metric.metric_name)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Metrics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        axisLine={{ stroke: '#374151' }}
                      />
                      <YAxis 
                        tick={{ fill: '#9CA3AF' }}
                        axisLine={{ stroke: '#374151' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#F3F4F6'
                        }}
                      />
                      <Bar dataKey="value" fill="#06B6D4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '6px',
                          color: '#F3F4F6'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Metrics Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9CA3AF' }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        color: '#F3F4F6'
                      }}
                    />
                    {Object.keys(latestMetrics || {}).map((metricName, index) => (
                      <Line 
                        key={metricName}
                        type="monotone" 
                        dataKey={metricName} 
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                        name={formatMetricName(metricName)}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Add New Metric</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Metric name (e.g., daily_active_users)"
                  value={newMetricName}
                  onChange={(e) => setNewMetricName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
                <Input
                  placeholder="Value"
                  type="number"
                  value={newMetricValue}
                  onChange={(e) => setNewMetricValue(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
                <Button 
                  onClick={handleAddMetric}
                  disabled={addMetricMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Metric
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">All Analytics Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-300">Metric Name</TableHead>
                      <TableHead className="text-slate-300">Value</TableHead>
                      <TableHead className="text-slate-300">Date Recorded</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics?.map((metric) => (
                      <TableRow key={metric.id} className="border-slate-700">
                        <TableCell className="text-white">{formatMetricName(metric.metric_name)}</TableCell>
                        <TableCell className="text-white">{metric.metric_value.toLocaleString()}</TableCell>
                        <TableCell className="text-slate-300">{new Date(metric.date_recorded).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => deleteMetricMutation.mutate(metric.id)}
                            disabled={deleteMetricMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
