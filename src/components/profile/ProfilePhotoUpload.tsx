import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, User, AlertTriangle } from 'lucide-react';

export const ProfilePhotoUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAvatar();
    }
  }, [user]);

  const fetchAvatar = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setAvatarUrl(data?.avatar_url);
    } catch (error) {
      console.error('Error fetching avatar:', error);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG and PNG images are allowed.');
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('Image size must be less than 5MB.');
      return false;
    }

    setError(null);
    return true;
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Frontend validation
      if (!validateFile(file)) {
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      // Additional extension check
      if (!['jpg', 'jpeg', 'png'].includes(fileExt || '')) {
        setError('Only JPG and PNG images are allowed.');
        setUploading(false);
        return;
      }

      const fileName = `${user?.id}/${Math.random()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type, // Set the correct content type
          upsert: true
        });

      if (uploadError) {
        // Check for file type validation errors from Supabase
        if (uploadError.message.includes('type') || uploadError.message.includes('format')) {
          setError('Only JPG and PNG images are allowed.');
          throw new Error('Invalid file type');
        }
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(data.publicUrl);
      toast({
        title: "Success",
        description: "Profile photo uploaded successfully",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async () => {
    if (!user || !avatarUrl) return;
    
    try {
      setDeleting(true);

      // Extract file path from URL
      const url = new URL(avatarUrl);
      const filePath = url.pathname.split('/').slice(-2).join('/');

      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        throw deleteError;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(null);
      toast({
        title: "Success",
        description: "Profile photo removed successfully",
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Error",
        description: "Failed to remove profile photo",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-32 w-32">
          <AvatarImage src={avatarUrl || undefined} alt="Profile" />
          <AvatarFallback className="bg-slate-700 text-slate-300 text-2xl">
            <User className="h-16 w-16" />
          </AvatarFallback>
        </Avatar>
        
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-2 rounded-md border border-red-400/20">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:text-white hover:bg-slate-700"
            disabled={uploading}
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </Button>
          
          {avatarUrl && (
            <Button
              variant="outline"
              className="border-red-600 text-red-400 hover:text-white hover:bg-red-600"
              disabled={deleting}
              onClick={deleteAvatar}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Removing...' : 'Remove'}
            </Button>
          )}
        </div>
        
        <input
          id="avatar-upload"
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          onChange={uploadAvatar}
          className="hidden"
          title="Upload profile photo (JPG or PNG only)"
        />
      </div>
      
      <div className="text-sm text-slate-400 text-center">
        <p>Recommended: Square image, at least 200x200 pixels</p>
        <p>Supported formats: JPG, PNG (max 5MB)</p>
      </div>
    </div>
  );
};