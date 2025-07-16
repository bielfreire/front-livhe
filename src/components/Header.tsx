import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, UserRound } from 'lucide-react';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/use-profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { useTikTokMonitor } from '@/contexts/TikTokMonitorContext';

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isLoading } = useProfile();
  const { t } = useTranslation();
  const { stopMonitoringOnLogout } = useTikTokMonitor();

  const handleLogout = async () => {
    try {
      // Encerra o monitoramento do TikTok se estiver ativo
      await stopMonitoringOnLogout();
    } catch (error) {
      console.error('Erro ao encerrar monitoramento durante logout:', error);
    }
    
    authService.removeToken();
    toast({
      title: t('layout.logoutSuccess'),
      description: t('layout.redirectingToHome'),
    });
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `http://localhost:4000${url}`;
  };

  return (
    <header className="flex justify-between items-center p-4 border-b border-[#2A2D36]">
      <button 
        onClick={handleGoBack}
        className="p-2 rounded-full hover:bg-[#2A2D36]"
      >
        <ArrowLeft className="text-gray-400" />
      </button>
      
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        
        <Link to="/profile" className="flex items-center text-white hover:text-[#FFD110] gap-2">
          {profile?.photo ? (
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={getFullImageUrl(profile.photo)} 
                alt={profile.name || profile.account} 
              />
              <AvatarFallback className="bg-[#2A2D36] text-sm">
                {profile.name?.charAt(0).toUpperCase() || profile.account?.charAt(1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <UserRound className="w-5 h-5" />
          )}
          <span>{isLoading ? t('layout.loading') : profile?.account || t('layout.profile')}</span>
        </Link>
        
        <Button 
          onClick={handleLogout} 
          variant="ghost"
          className="flex items-center text-white hover:text-[#FFD110] hover:bg-[#2A2D36]"
        >
          <LogOut className="w-5 h-5 mr-1" />
          {t('common.logout')}
        </Button>
      </div>
    </header>
  );
};

export default Header;
