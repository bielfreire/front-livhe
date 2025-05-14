import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { useProfile } from '@/hooks/use-profile';

import {
  Home,
  Gamepad2,
  PlayCircle,
  Monitor,
  Gem,
  Settings,
  ShieldCheck
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { profile } = useProfile();

  const menuItems = [
    { path: "/home", label: "Início", icon: <Home className="w-5 h-5" /> },
    { path: "/games", label: "Jogos", icon: <Gamepad2 className="w-5 h-5" /> },
    { path: "/battle", label: "Batalhas", icon: <PlayCircle className="w-5 h-5" /> },
    { path: "/overlays", label: "Overlays", icon: <Monitor className="w-5 h-5" /> },
    { path: "/plans", label: "Planos", icon: <Gem className="w-5 h-5" /> },
    { path: "/profile", label: "Configurações", icon: <Settings className="w-5 h-5" /> },
    // Só mostra Administração se for admin
    ...(profile?.role === 'admin' ? [
      { path: "/admin", label: "Administração", icon: <ShieldCheck className="w-5 h-5" /> },
    ] : []),
  ];
  

  return (
    <div className="w-60 bg-[#1A1C24] border-r border-[#2A2D36] p-4 flex flex-col">
      <div className="mb-10 flex justify-center">
        <Logo size="large" linkTo="/" />
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
    </div>
  );
};

export default Sidebar;
