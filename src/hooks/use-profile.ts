import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';

interface Preset {
  id: number;
  name: string;
  action: string;
  keybind: string;
  delay: number;
  active: boolean;
  giftName?: string;
  giftImageUrl?: string;
  soundTitle?: string;
  soundUrl?: string;
}

interface Profile {
  id: number;
  email: string;
  name: string;
  account: string;
  plan: string;
  role: string;
  photo?: string;
  host?: string;
  port?: number;
  passwordServer?: string;
  presets?: Preset[];
}

interface UpdateProfileData {
  name?: string;
  account?: string;
  photo?: File;
  host?: string;
  port?: number;
  passwordServer?: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await apiRequest('/users/profile', {
          method: 'GET',
          isAuthenticated: true
        });
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setIsUpdating(true);
      
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.account) formData.append('account', data.account);
      if (data.photo) formData.append('photo', data.photo);
      if (data.host) formData.append('host', data.host);
      if (data.port) formData.append('port', data.port.toString());
      if (data.passwordServer) formData.append('passwordServer', data.passwordServer);
      
      const updatedProfile = await apiRequest('/users/update-profile', {
        method: 'PATCH',
        body: formData,
        isAuthenticated: true,
        // FormData doesn't need Content-Type header, browser sets it automatically
        headers: {} 
      });
      
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  return { profile, isLoading, error, updateProfile, isUpdating };
};
