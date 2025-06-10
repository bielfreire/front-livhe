import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserRound, Link as LinkIcon, Copy, MoreHorizontal, Gem, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { config } from "@/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ConfirmDialog";

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
  referralUuid?: string;
  referredBy?: string;
  referralsCount?: number;
  referralsCountFree?: number;
  referralsCountPremium?: number;
  createdAt: string;
  check?: boolean;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState<number | null>(null);
  const [updatingCheck, setUpdatingCheck] = useState<number | null>(null);
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: number | null;
    newStatus: boolean;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    newStatus: false,
    userName: '',
  });
  const { toast } = useToast();

  // Filtro de datas
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [periodUsers, setPeriodUsers] = useState<User[] | null>(null);
  const [periodLoading, setPeriodLoading] = useState(false);

  // Filtro de datas e usuário para indicações
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [referralStartDate, setReferralStartDate] = useState("");
  const [referralEndDate, setReferralEndDate] = useState("");
  const [referralResult, setReferralResult] = useState<any | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);

  // Estados para paginação
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [refPage, setRefPage] = useState(1);
  const [refTotal, setRefTotal] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    if (referralResult) {
      fetchReferralsByPeriod(refPage);
    }
    // eslint-disable-next-line
  }, [refPage]);

  const fetchUsers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await apiRequest(`/users?page=${pageNum}&limit=${PAGE_SIZE}`, {
        method: "GET",
        isAuthenticated: true,
      });
      setUsers(response.data || []);
      setTotalUsers(response.total || 0);
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

  const fetchUsersByPeriod = async () => {
    if (!startDate || !endDate) {
      toast({ title: "Selecione as duas datas!", variant: "destructive" });
      return;
    }
    setPeriodLoading(true);
    try {
      const response = await apiRequest(`/users/by-period?start=${startDate}&end=${endDate}`, {
        method: "GET",
        isAuthenticated: true,
      });
      setPeriodUsers(response || []);
    } catch (error) {
      toast({ title: "Erro ao buscar por período", variant: "destructive" });
    } finally {
      setPeriodLoading(false);
    }
  };

  const fetchReferralsByPeriod = async (pageNum = 1) => {
    if (!selectedUserId || !referralStartDate || !referralEndDate) {
      toast({ title: "Selecione o usuário e as datas!", variant: "destructive" });
      return;
    }
    setReferralLoading(true);
    try {
      const response = await apiRequest(`/users/referrals-by-period?userId=${selectedUserId}&start=${referralStartDate}&end=${referralEndDate}&page=${pageNum}&limit=${PAGE_SIZE}`, {
        method: "GET",
        isAuthenticated: true,
      });
      setReferralResult(response);
      setRefTotal(response.total || 0);
    } catch (error) {
      toast({ title: "Erro ao buscar indicações", variant: "destructive" });
    } finally {
      setReferralLoading(false);
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

  const handleToggleCheck = (userId: number, currentCheck: boolean) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmDialog({
      isOpen: true,
      userId,
      newStatus: !currentCheck,
      userName: user.name || user.account,
    });
  };

  const toggleUserCheck = async () => {
    if (!confirmDialog.userId) return;

    try {
      setUpdatingCheck(confirmDialog.userId);
      await apiRequest(`/users/update-check`, {
        method: "PATCH",
        body: {
          userId: confirmDialog.userId,
          check: confirmDialog.newStatus
        },
        isAuthenticated: true,
      });

      // Atualiza a lista de usuários
      setUsers(users.map(user => 
        user.id === confirmDialog.userId 
          ? { ...user, check: confirmDialog.newStatus }
          : user
      ));

      // Toast informativo
      toast({
        title: confirmDialog.newStatus ? "Usuário habilitado!" : "Usuário desabilitado!",
        description: confirmDialog.newStatus 
          ? `${confirmDialog.userName} agora faz parte do Creators Club.`
          : `${confirmDialog.userName} foi removido do Creators Club.`,
        variant: confirmDialog.newStatus ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
        variant: "destructive",
      });
    } finally {
      setUpdatingCheck(null);
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuário? Essa ação não pode ser desfeita.')) return;
    try {
      await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
        isAuthenticated: true,
      });
      toast({ title: 'Usuário deletado com sucesso!', variant: 'default' });
      fetchUsers(page);
    } catch (error) {
      toast({ title: 'Erro ao deletar usuário', variant: 'destructive' });
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `${config.apiUrl}${url}`;
  };

  const updateUserRole = async (userId: number, newRole: 'admin' | 'user') => {
    try {
      setUpdatingRole(userId);
      await apiRequest(`/users/update-role`, {
        method: "PATCH",
        body: {
          userId,
          role: newRole
        },
        isAuthenticated: true,
      });

      // Atualiza a lista de usuários
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));

      toast({
        title: "Sucesso",
        description: `Papel do usuário atualizado para ${newRole === 'admin' ? 'Administrador' : 'Usuário'}`,
      });
    } catch (error) {
      console.error("Erro ao atualizar papel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o papel do usuário.",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            
            {/* Filtro de indicações por usuário e período */}
            <div className="flex flex-col md:flex-row gap-2 mb-6 items-center bg-[#23252b] p-3 rounded">
              <label className="text-sm text-white">Usuário:
                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="ml-2 rounded bg-[#222429] text-white px-2 py-1">
                  <option value="">Selecione</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name || u.account}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-white">De:
                <input type="date" value={referralStartDate} onChange={e => setReferralStartDate(e.target.value)} className="ml-2 rounded bg-[#222429] text-white px-2 py-1" />
              </label>
              <label className="text-sm text-white">Até:
                <input type="date" value={referralEndDate} onChange={e => setReferralEndDate(e.target.value)} className="ml-2 rounded bg-[#222429] text-white px-2 py-1" />
              </label>
              <Button
                onClick={() => {
                  setRefPage(1);
                  fetchReferralsByPeriod(1);
                }}
                className="ml-2"
              >
                Buscar Indicações
              </Button>
              {referralResult && (
                <Button variant="outline" onClick={() => { setReferralResult(null); setSelectedUserId(""); setReferralStartDate(""); setReferralEndDate(""); setRefPage(1); }} className="ml-2">Limpar filtro</Button>
              )}
              {referralLoading && <Loader2 className="h-4 w-4 animate-spin text-[#FFD110] ml-2" />}
              {referralResult && (
                <span className="ml-4 text-green-400 font-semibold">
                  Indicações: {referralResult.total} (Free: {referralResult.free}, Premium: {referralResult.premium})
                </span>
              )}
            </div>
            {/* Lista de indicados do usuário filtrado */}
            {referralResult && (
              <div className="grid gap-4 mb-6">
                {referralResult.users.length === 0 ? (
                  <div className="text-center text-gray-400">Nenhuma indicação neste período.</div>
                ) : (
                  referralResult.users.map((user: User) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-[#2A2D36] border-2 border-[#FFD110] rounded-lg relative"
                    >
                      <span className="absolute top-2 left-2 bg-[#FFD110] text-black text-[10px] px-2 py-0.5 rounded-full font-bold">Indicação do filtro</span>
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
                          <p className="text-xs text-gray-400 mt-1">Cadastrado em: {new Date(user.createdAt).toLocaleDateString()}</p>
                          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${user.plan === 'free' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-400/20 text-yellow-600'}`}>{user.plan === 'free' ? 'Free' : 'Premium'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {/* Lista de usuários filtrada por período, se houver filtro */}
            {periodUsers ? (
              <div className="grid gap-4">
                {periodUsers.length === 0 ? (
                  <div className="text-center text-gray-400">Nenhum usuário cadastrado neste período.</div>
                ) : (
                  periodUsers.map((user) => (
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
                          <p className="text-xs text-gray-400 mt-1">Cadastrado em: {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <>
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
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-[#FFD110] break-all">
                                  Link: {user.referralLink}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    navigator.clipboard.writeText(user.referralLink!);
                                    toast({
                                      title: "Link copiado!",
                                      description: "Link de indicação copiado para a área de transferência",
                                    });
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateReferralLink(user.id)}
                              disabled={generatingLink === user.id}
                              className="flex items-center gap-2 mt-2"
                            >
                              {generatingLink === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <LinkIcon className="h-4 w-4" />
                              )}
                              {user.referralLink ? "Regenerar Link" : "Gerar Link"}
                            </Button>
                            <p className="text-xs text-green-400 mt-1 font-semibold">
                              Indicações: {user.referralsCount ?? 0}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span
                                className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-medium"
                                title="Indicações de usuários Free"
                              >
                                <UserRound className="h-3 w-3" /> {user.referralsCountFree ?? 0} Free
                              </span>
                              <span
                                className="flex items-center gap-1 bg-yellow-400/20 text-yellow-600 px-2 py-0.5 rounded text-xs font-medium"
                                title="Indicações de usuários Premium"
                              >
                                <Gem className="h-3 w-3" /> {user.referralsCountPremium ?? 0} Premium
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                            disabled={updatingRole === user.id}
                            className="flex items-center gap-2"
                          >
                            {updatingRole === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                {user.role === 'admin' ? 'Tornar Usuário' : 'Tornar Admin'}
                              </>
                            )}
                          </Button>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.plan === 'free' 
                              ? 'bg-gray-500/20 text-gray-400' 
                              : 'bg-[#FFD110]/20 text-[#FFD110]'
                          }`}>
                            {user.plan === 'free' ? 'Plano Gratuito' : 'Plano Premium'}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleCheck(user.id, user.check || false)}
                            disabled={updatingCheck === user.id}
                            className={`flex items-center gap-2 ${
                              user.check 
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50' 
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50'
                            }`}
                          >
                            {updatingCheck === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                {user.check ? (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Creators Club</span>
                                  </>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                    <span>Adicionar ao Creators Club</span>
                                  </>
                                )}
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteUser(user.id)} title="Deletar usuário">
                            <Trash2 className="h-5 w-5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {/* Paginação lista geral */}
            {!periodUsers && !referralResult && totalUsers > PAGE_SIZE && (
              <div className="flex justify-center mt-4 gap-2">
                <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                <span className="text-white px-2">Página {page} de {Math.ceil(totalUsers / PAGE_SIZE)}</span>
                <Button disabled={page === Math.ceil(totalUsers / PAGE_SIZE)} onClick={() => setPage(page + 1)}>Próxima</Button>
              </div>
            )}
            {/* Paginação lista de indicações filtradas */}
            {referralResult && refTotal > PAGE_SIZE && (
              <div className="flex justify-center mt-4 gap-2">
                <Button disabled={refPage === 1} onClick={() => setRefPage(refPage - 1)}>Anterior</Button>
                <span className="text-white px-2">Página {refPage} de {Math.ceil(refTotal / PAGE_SIZE)}</span>
                <Button disabled={refPage === Math.ceil(refTotal / PAGE_SIZE)} onClick={() => setRefPage(refPage + 1)}>Próxima</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={toggleUserCheck}
        title={confirmDialog.newStatus ? "Habilitar Creators Club" : "Desabilitar Creators Club"}
        description={confirmDialog.newStatus 
          ? `Você está prestes a habilitar ${confirmDialog.userName} para o Creators Club. Esta ação dará acesso a recursos exclusivos.`
          : `Você está prestes a remover ${confirmDialog.userName} do Creators Club. Esta ação removerá o acesso aos recursos exclusivos.`
        }
        confirmText={confirmDialog.newStatus ? "Habilitar" : "Desabilitar"}
        cancelText="Cancelar"
      />
    </Layout>
  );
};

export default Users; 