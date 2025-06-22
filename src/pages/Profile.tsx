import { useState } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';
import { EmailChangeForm } from '@/components/profile/EmailChangeForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { SocialMediaForm } from '@/components/profile/SocialMediaForm';
import { ProfileInfo } from '@/components/profile/ProfileInfo';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import { User, Settings, Lock, Share2, Camera } from 'lucide-react';

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header />
      <SubscriptionBanner />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-cyan-500/20 p-2 sm:p-3 rounded-lg">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              User <span className="text-cyan-400">Profile</span>
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto px-2">
            Manage your account settings and personal information
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-5 bg-slate-800/50 border border-slate-700">
                <TabsTrigger 
                  value="profile" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <User className="h-4 w-4 mr-1 sm:mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="photo" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <Camera className="h-4 w-4 mr-1 sm:mr-2" />
                  Photo
                </TabsTrigger>
                <TabsTrigger 
                  value="email" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger 
                  value="password" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <Lock className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Password</span>
                  <span className="sm:hidden">Pass</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="social" 
                  className="text-slate-300 data-[state=active]:text-white data-[state=active]:bg-slate-700 whitespace-nowrap px-3 sm:px-4"
                >
                  <Share2 className="h-4 w-4 mr-1 sm:mr-2" />
                  Social
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-white text-lg sm:text-xl">Profile Information</CardTitle>
                  <CardDescription className="text-slate-400 text-sm sm:text-base">
                    View and edit your basic profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ProfileInfo />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photo">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-white text-lg sm:text-xl">Profile Photo</CardTitle>
                  <CardDescription className="text-slate-400 text-sm sm:text-base">
                    Upload and manage your profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ProfilePhotoUpload />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-white text-lg sm:text-xl">Change Email</CardTitle>
                  <CardDescription className="text-slate-400 text-sm sm:text-base">
                    Update your email address for account access
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <EmailChangeForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-white text-lg sm:text-xl">Change Password</CardTitle>
                  <CardDescription className="text-slate-400 text-sm sm:text-base">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <PasswordChangeForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-white text-lg sm:text-xl">Social Media Accounts</CardTitle>
                  <CardDescription className="text-slate-400 text-sm sm:text-base">
                    Connect your social media profiles
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <SocialMediaForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile;