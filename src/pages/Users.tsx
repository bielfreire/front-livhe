import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserRound, Link as LinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { config } from "@/config";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  name: string;
  email: string;
  account: string;
  role: 'admin' | 'user';
  plan: string;
  photo?: string;
  host?: string;
  port?: number;
  referralLink?: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/users", {
        method: "GET",
        isAuthenticated: true,
      });
      setUsers(response || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = async (userId: number) => {
    try {
      setGeneratingLink(userId);
      
      // Atualiza o usuário com o novo referralLink
      const response = await apiRequest(`/users/update-referral-link`, {
        method: "PATCH",
        body: {
          userId
        },
        isAuthenticated: true,
      });

      // Atualiza a lista de usuários
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, referralLink: response.referralLink }
          : user
      ));

      toast({
        title: "Sucesso",
        description: "Link de indicação gerado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao gerar link de indicação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o link de indicação.",
        variant: "destructive",
      });
    } finally {
      setGeneratingLink(null);
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${config.apiUrl}${url}`;
  };

  return (
    <Layout>
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-[#FFD110]" />
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-[#2A2D36] rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={getFullImageUrl(user.photo)}
                          alt={user.name || user.account}
                        />
                        <AvatarFallback className="bg-[#1A1C24]">
                          <UserRound className="h-6 w-6 text-[#FFD110]" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-white">
                          {user.name || user.account}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">{user.email}</p>
                          <span className="text-xs text-gray-500">•</span>
                          <p className="text-sm text-gray-400">ID: {user.id}</p>
                        </div>
                        {user.referralLink && (
                          <p className="text-xs text-[#FFD110] mt-1">
                            Link: {user.referralLink}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateReferralLink(user.id)}
                        disabled={generatingLink === user.id}
                        className="flex items-center gap-2"
                      >
                        {generatingLink === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LinkIcon className="h-4 w-4" />
                        )}
                        {user.referralLink ? "Regenerar Link" : "Gerar Link"}
                      </Button>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.plan === 'free' 
                          ? 'bg-gray-500/20 text-gray-400' 
                          : 'bg-[#FFD110]/20 text-[#FFD110]'
                      }`}>
                        {user.plan === 'free' ? 'Plano Gratuito' : 'Plano Premium'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Users; 