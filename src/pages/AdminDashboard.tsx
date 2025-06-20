import { useState } from 'react';
import { Header } from '@/components/Header';
import { AdminRoute } from '@/components/AdminRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { AddUser } from '@/components/admin/AddUser';
import { PaymentMethodsManagement } from '@/components/admin/PaymentMethodsManage';
import { AddNewsSource } from '@/components/admin/AddNewsSource';
import { NewsSourcesManagement } from '@/components/admin/NewsSourcesManagement';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { SystemMonitor } from '@/components/admin/SystemMonitor';
import { CouponManagement } from '@/components/admin/CouponManagement';
import { Settings, Users, CreditCard, Plus, BarChart3, Shield, Rss, Monitor, Percent } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-cyan-500/20 p-2 sm:p-3 rounded-lg">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Admin <span className="text-cyan-400">Dashboard</span>
              </h1>
            </div>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto px-2">
              Manage users, content, and monitor system analytics
            </p>
          </div>

          <Tabs defaultValue="analytics" className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-7 bg-slate-800/50 border border-slate-700">
                <TabsTrigger 
                  value="analytics" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="monitor" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <Monitor className="h-4 w-4 mr-1 sm:mr-2" />
                  Monitor
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <Users className="h-4 w-4 mr-1 sm:mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="payments" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <CreditCard className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Payments</span>
                  <span className="sm:hidden">Pay</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="coupons" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <Percent className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Coupons</span>
                  <span className="sm:hidden">%</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Content</span>
                  <span className="sm:hidden">Add</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="sources" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <Rss className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">News Sources</span>
                  <span className="sm:hidden">News</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="monitor">
              <SystemMonitor />
            </TabsContent>

            <TabsContent value="users" className="space-y-4 sm:space-y-6">
              <AddUser />
              <UsersManagement />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentMethodsManagement />
            </TabsContent>

            <TabsContent value="coupons">
              <CouponManagement />
            </TabsContent>

            <TabsContent value="content">
              <AddNewsSource />
            </TabsContent>

            <TabsContent value="sources">
              <NewsSourcesManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AdminRoute>
  );
};

export default AdminDashboard;
