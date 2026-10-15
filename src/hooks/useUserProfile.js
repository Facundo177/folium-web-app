import { useState, useEffect, useCallback } from 'react';
import { userService } from '../api/services/userService';

export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await userService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar los datos del perfil.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, setProfile, isLoading, error, refetch: fetchProfile };
}