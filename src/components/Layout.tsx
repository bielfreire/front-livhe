// components/Layout.tsx
import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, UserRound, Users } from "lucide-react";
import Logo from "./Logo";
import { useProfile } from "@/hooks/use-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

import {
  Home,
  Gamepad2,
  PlayCircle,
  Monitor,
  Gem,
  Settings,
  ShieldCheck,
  Mail,
  BookOpen,
  Download
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isLoading } = useProfile();
  const { toast } = useToast();

  const menuItems = [
    { path: "/home", label: t('common.home'), icon: <Home className="w-5 h-5" /> },
    { path: "/games", label: t('navigation.games'), icon: <Gamepad2 className="w-5 h-5" /> },
    { path: "/battle", label: t('navigation.battle'), icon: <PlayCircle className="w-5 h-5" /> },
    { path: "/overlays", label: t('navigation.overlays'), icon: <Monitor className="w-5 h-5" /> },
    { path: "/plans", label: t('navigation.plans'), icon: <Gem className="w-5 h-5" /> },
    { path: "/tutorials", label: t('navigation.tutorials'), icon: <BookOpen className="w-5 h-5" /> },
    { path: "/updates", label: t('navigation.updates'), icon: <Download className="w-5 h-5" /> },
    { path: "/contact", label: t('navigation.contact'), icon: <Mail className="w-5 h-5" /> },
    { path: "/profile", label: t('navigation.settings'), icon: <Settings className="w-5 h-5" /> },
    // Só mostra Administração e Usuários se for admin
    ...(profile?.role === 'admin' ? [
      { path: "/admin", label: t('navigation.administration'), icon: <ShieldCheck className="w-5 h-5" /> },
      { path: "/users", label: t('navigation.users'), icon: <Users className="w-5 h-5" /> },
    ] : []),
  ];
  
  const handleLogout = () => {
    // Remove o token do localStorage
    authService.removeToken();
    toast({
      title: t('layout.logoutSuccess'),
      description: t('layout.redirectingToHome'),
    });
    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const handleBack = () => {
    navigate(-1); // Navega para a página anterior
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${config.apiUrl}${url}`;
  };

  return (
    <div className="flex min-h-screen bg-[#1A1C24]">
      {/* Sidebar */}
      <div className="w-60 bg-[#1A1C24] border-r border-[#2A2D36] p-4 flex flex-col">
        <div className="flex justify-center items-center mb-10">
          <Logo size="medium" linkTo="/home" />
        </div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg border-l-4 ${
                    location.pathname === item.path
                      ? "text-white bg-[#FFD110]/10 border-[#FFD110]"
                      : "text-gray-400 hover:bg-[#2A2D36] border-transparent"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 mt-auto text-gray-400 hover:text-white hover:bg-[#2A2D36] rounded-lg border-l-4 border-transparent"
        >
          <LogOut className="w-6 h-6 mr-3" />
          <span className="font-medium">{t('common.logout')}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="flex justify-between items-center p-4 border-b border-[#2A2D36]">
          <button 
            onClick={handleBack}
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
          </div>
        </header>

        {/* Conteúdo dinâmico */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
