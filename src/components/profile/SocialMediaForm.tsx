
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Twitter, Linkedin, Github, Globe } from 'lucide-react';

interface SocialMedia {
  twitter_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
}

export const SocialMediaForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socialMedia, setSocialMedia] = useState<SocialMedia>({
    twitter_url: '',
    linkedin_url: '',
    github_url: '',
    website_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSocialMedia();
    }
  }, [user]);

  const fetchSocialMedia = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('twitter_url, linkedin_url, github_url, website_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setSocialMedia({
        twitter_url: data?.twitter_url || '',
        linkedin_url: data?.linkedin_url || '',
        github_url: data?.github_url || '',
        website_url: data?.website_url || '',
      });
    } catch (error) {
      console.error('Error fetching social media:', error);
      toast({
        title: "Error",
        description: "Failed to load social media links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          twitter_url: socialMedia.twitter_url || null,
          linkedin_url: socialMedia.linkedin_url || null,
          github_url: socialMedia.github_url || null,
          website_url: socialMedia.website_url || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Social media links updated successfully",
      });
    } catch (error) {
      console.error('Error updating social media:', error);
      toast({
        title: "Error",
        description: "Failed to update social media links",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-slate-300">Loading social media links...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="twitter" className="text-slate-300 flex items-center gap-2">
            <Twitter className="h-4 w-4 text-blue-400" />
            Twitter/X Profile
          </Label>
          <Input
            id="twitter"
            type="url"
            value={socialMedia.twitter_url || ''}
            onChange={(e) => setSocialMedia({ ...socialMedia, twitter_url: e.target.value })}
            placeholder="https://twitter.com/yourusername"
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin" className="text-slate-300 flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-blue-600" />
            LinkedIn Profile
          </Label>
          <Input
            id="linkedin"
            type="url"
            value={socialMedia.linkedin_url || ''}
            onChange={(e) => setSocialMedia({ ...socialMedia, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/yourusername"
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github" className="text-slate-300 flex items-center gap-2">
            <Github className="h-4 w-4 text-slate-300" />
            GitHub Profile
          </Label>
          <Input
            id="github"
            type="url"
            value={socialMedia.github_url || ''}
            onChange={(e) => setSocialMedia({ ...socialMedia, github_url: e.target.value })}
            placeholder="https://github.com/yourusername"
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="text-slate-300 flex items-center gap-2">
            <Globe className="h-4 w-4 text-green-400" />
            Personal Website
          </Label>
          <Input
            id="website"
            type="url"
            value={socialMedia.website_url || ''}
            onChange={(e) => setSocialMedia({ ...socialMedia, website_url: e.target.value })}
            placeholder="https://yourwebsite.com"
            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Social Links'}
        </Button>
      </form>

      <div className="text-sm text-slate-400">
        <p>Tips for social media links:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Include the full URL (starting with https://)</li>
          <li>Make sure your profiles are public if you want them to be discoverable</li>
          <li>You can leave any fields empty if you don't use those platforms</li>
        </ul>
      </div>
    </div>
  );
};
