import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { useProfile } from "@/hooks/use-profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, Mail, Package, Edit, Check, X, AtSign, Server, Network, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Breadcrumb from "@/components/Breadcrumb";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAccount, setEditAccount] = useState("");
  const [editHost, setEditHost] = useState("");
  const [editPort, setEditPort] = useState("");
  const [editPasswordServer, setEditPasswordServer] = useState("");
  const [showPasswordServer, setShowPasswordServer] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  

  if (isLoading || !profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FFD110]"></div>
        </div>
      </MainLayout>
    );
  }

  const handleEditProfile = () => {
    setEditName(profile.name || "");
    // Remove o @ do início do account se existir
    setEditAccount(profile.account?.startsWith('@') ? profile.account.substring(1) : profile.account || "");
    setEditHost(profile.host || "");
    setEditPort(profile.port?.toString() || "");
    setEditPasswordServer(profile.passwordServer || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      // Garante que o account tenha o @ no início
      const formattedAccount = editAccount.startsWith('@') ? editAccount : `@${editAccount}`;
      
      await updateProfile({ 
        name: editName,
        account: formattedAccount,
        host: editHost,
        port: editPort ? parseInt(editPort, 10) : undefined,
        passwordServer: editPasswordServer
      });
      setIsEditing(false);
      toast({
        title: t('profile.updateSuccess'),
        description: t('profile.updateSuccessDescription'),
      });
    } catch (error) {
      toast({
        title: t('profile.updateError'),
        description: t('profile.updateErrorDescription'),
        variant: "destructive",
      });
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `http://localhost:4000${url}`;
  };

  return (
    <MainLayout>
       <Breadcrumb
                items={[
                    { label: t('common.home'), path: "/home" },
                    { label: t('profile.title'), path: "/profile" },
                ]}
            />
      <div className="container mx-auto">
        <Card className="max-w-3xl mx-auto bg-[#1E2028] border-[#2A2D36]">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarFallback className="bg-[#2A2D36] text-3xl">
                    {profile.name?.charAt(0).toUpperCase() || profile.account?.charAt(1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                {isEditing ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="space-y-2 w-full max-w-xs">
                      <div>
                        <label htmlFor="name" className="text-sm text-gray-400 block mb-1">{t('profile.fullName')}</label>
                        <Input
                          id="name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-[#2A2D36] border-[#3A3D46] text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="account" className="text-sm text-gray-400 block mb-1">{t('profile.username')}</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <AtSign className="h-4 w-4" />
                          </span>
                          <Input
                            id="account"
                            value={editAccount}
                            onChange={(e) => setEditAccount(e.target.value)}
                            className="bg-[#2A2D36] border-[#3A3D46] text-white pl-10"
                            placeholder="username"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="host" className="text-sm text-gray-400 block mb-1">{t('profile.host')}</label>
                        <Input
                          id="host"
                          value={editHost}
                          onChange={(e) => setEditHost(e.target.value)}
                          className="bg-[#2A2D36] border-[#3A3D46] text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="port" className="text-sm text-gray-400 block mb-1">{t('profile.port')}</label>
                        <Input
                          id="port"
                          value={editPort}
                          onChange={(e) => setEditPort(e.target.value)}
                          className="bg-[#2A2D36] border-[#3A3D46] text-white"
                          type="number"
                        />
                      </div>
                      <div>
                        <label htmlFor="passwordServer" className="text-sm text-gray-400 block mb-1">{t('profile.passwordServer')}</label>
                        <div className="relative">
                          <Input
                            id="passwordServer"
                            value={editPasswordServer}
                            onChange={(e) => setEditPasswordServer(e.target.value)}
                            className="bg-[#2A2D36] border-[#3A3D46] text-white"
                            type={showPasswordServer ? "text" : "password"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordServer(!showPasswordServer)}
                            className="absolute inset-y-0 right-3 text-gray-400 hover:text-white"
                          >
                            {showPasswordServer ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={handleSaveEdit}
                        disabled={isUpdating}
                      >
                        <Check className="h-4 w-4" />
                        {t('profile.save')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4" />
                        {t('profile.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-2xl text-white">
                      {profile.account}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {profile.role === "admin" ? t('profile.role.admin') : t('profile.role.user')}
                    </CardDescription>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-400">
                <UserRound className="h-5 w-5" />
                <span>{t('profile.fullName')}:</span>
                <span className="text-white">{profile.name || t('profile.notInformed')}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <AtSign className="h-5 w-5" />
                <span>{t('profile.username')}:</span>
                <span className="text-white">{profile.account}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="h-5 w-5" />
                <span>{t('profile.email')}:</span>
                <span className="text-white">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Package className="h-5 w-5" />
                <span>{t('profile.plan')}:</span>
                <span className="text-white capitalize">
                  {profile.plan || "Free"}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 flex justify-center">
            <Button 
              onClick={handleEditProfile} 
              className="bg-[#2A2D36] hover:bg-[#3A3D46] text-white"
              disabled={isEditing || isUpdating}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('profile.editProfile')}
            </Button>
          </CardFooter>
        </Card>

        {/* Novo card para informações do servidor de Minecraft */}
        <Card className="max-w-3xl mx-auto bg-[#1E2028] border-[#2A2D36] mt-6">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold text-white text-center">{t('profile.serverInfo')}</h3>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-400">
              <Server className="h-5 w-5" />
              <span>{t('profile.host')}:</span>
              <span className="text-white">{profile.host}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Network className="h-5 w-5" />
              <span>{t('profile.port')}:</span>
              <span className="text-white">{profile.port}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <KeyRound className="h-5 w-5" />
              <span>{t('profile.passwordServer')}:</span>
              <span className="text-white">
                {showPasswordServer ? profile.passwordServer : "••••••••"}
              </span>
              <button
                type="button"
                onClick={() => setShowPasswordServer(!showPasswordServer)}
                className="text-gray-400 hover:text-white"
              >
                {showPasswordServer ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;
