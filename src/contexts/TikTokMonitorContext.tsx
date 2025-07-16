import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import TikTokMonitor from "@/components/TikTokMonitor";
import { useProfile } from "@/hooks/use-profile";
import { apiRequest } from "@/utils/api";

interface TikTokMonitorContextType {
    username: string;
    isMonitoring: boolean;
    showMonitor: boolean;
    startMonitoring: (username: string, moodId?: string) => void;
    stopMonitoring: () => void;
    closeMonitor: () => void;
    stopMonitoringOnLogout: () => Promise<void>;
}

const TikTokMonitorContext = createContext<TikTokMonitorContextType | undefined>(undefined);

export function TikTokMonitorProvider({ children }: { children: ReactNode }) {
    const { profile } = useProfile();
    const [username, setUsername] = useState(() => {
        const savedUsername = localStorage.getItem('tiktok_monitor_username');
        return savedUsername || "";
    });
    const [isMonitoring, setIsMonitoring] = useState(() => {
        const savedMonitoring = localStorage.getItem('tiktok_monitor_status');
        return savedMonitoring === 'true';
    });
    const [showMonitor, setShowMonitor] = useState(() => {
        const savedMonitoring = localStorage.getItem('tiktok_monitor_status');
        return savedMonitoring === 'true';
    });

    // Verificar status do monitoramento no backend quando o app carrega
    useEffect(() => {
        // Se não estiver autenticado, limpa o monitoramento
        if (!profile) {
            setIsMonitoring(false);
            setShowMonitor(false);
            setUsername("");
            localStorage.removeItem('tiktok_monitor_username');
            localStorage.removeItem('tiktok_monitor_status');
            return;
        }

        const checkMonitoringStatus = async () => {
            const savedUsername = localStorage.getItem('tiktok_monitor_username');
            const savedMonitoring = localStorage.getItem('tiktok_monitor_status');
            
            // Só verifica se há dados salvos no localStorage
            if (savedUsername && savedMonitoring === 'true') {
                try {
                    const response = await apiRequest(`/tiktok/monitor/status?username=${savedUsername}`, {
                        method: 'GET',
                        isAuthenticated: true
                    });
                    
                    // Se o backend não está monitorando, limpa o estado local
                    if (!response.isMonitoring) {
                        console.log('🔄 Sincronizando estado: monitoramento não está ativo no backend');
                        setIsMonitoring(false);
                        setShowMonitor(false);
                        setUsername(profile?.account || "");
                        localStorage.removeItem('tiktok_monitor_username');
                        localStorage.removeItem('tiktok_monitor_status');
                    } else {
                        console.log('✅ Sincronizando estado: monitoramento está ativo no backend');
                        setUsername(savedUsername);
                        setIsMonitoring(true);
                        setShowMonitor(true);
                    }
                } catch (error) {
                    console.error('❌ Erro ao verificar status do monitoramento:', error);
                    // Se houver erro, assume que não está monitorando e limpa o estado
                    setIsMonitoring(false);
                    setShowMonitor(false);
                    setUsername(profile?.account || "");
                    localStorage.removeItem('tiktok_monitor_username');
                    localStorage.removeItem('tiktok_monitor_status');
                }
            }
        };

        // Só executa se o usuário estiver autenticado
        if (profile) {
            checkMonitoringStatus();
        }
    }, [profile]);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (isMonitoring) {
            localStorage.setItem('tiktok_monitor_username', username);
            localStorage.setItem('tiktok_monitor_status', isMonitoring.toString());
        } else {
            localStorage.removeItem('tiktok_monitor_username');
            localStorage.removeItem('tiktok_monitor_status');
            setShowMonitor(false);
        }
    }, [username, isMonitoring]);

    const startMonitoring = (newUsername: string, moodId?: string) => {
        setUsername(newUsername);
        setIsMonitoring(true);
        setShowMonitor(true);
    };

    const stopMonitoring = () => {
        setIsMonitoring(false);
        setShowMonitor(false);
        setUsername(profile?.account || "");
        localStorage.removeItem('tiktok_monitor_username');
        localStorage.removeItem('tiktok_monitor_status');
    };

    const closeMonitor = () => {
        setShowMonitor(false);
        if (!isMonitoring) {
            setUsername(profile?.account || "");
            setIsMonitoring(false);
            localStorage.removeItem('tiktok_monitor_username');
            localStorage.removeItem('tiktok_monitor_status');
        }
    };

    const stopMonitoringOnLogout = async () => {
        if (isMonitoring && username) {
            try {
                // Chama o endpoint para encerrar o monitoramento
                await apiRequest(`/tiktok/monitor?username=${username}`, {
                    method: 'DELETE',
                    isAuthenticated: true
                });
                
                console.log(`✅ Monitoramento encerrado automaticamente para ${username} durante logout`);
            } catch (error) {
                console.error('❌ Erro ao encerrar monitoramento durante logout:', error);
            } finally {
                // Sempre limpa o estado local, mesmo se a chamada da API falhar
                setIsMonitoring(false);
                setShowMonitor(false);
                setUsername(profile?.account || "");
                localStorage.removeItem('tiktok_monitor_username');
                localStorage.removeItem('tiktok_monitor_status');
            }
        }
    };

    return (
        <TikTokMonitorContext.Provider
            value={{
                username,
                isMonitoring,
                showMonitor,
                startMonitoring,
                stopMonitoring,
                closeMonitor,
                stopMonitoringOnLogout,
            }}
        >
            {children}
            {showMonitor && isMonitoring && (
                <TikTokMonitor
                    username={username}
                    isMonitoring={isMonitoring}
                    onClose={closeMonitor}
                />
            )}
        </TikTokMonitorContext.Provider>
    );
}

export function useTikTokMonitor() {
    const context = useContext(TikTokMonitorContext);
    if (context === undefined) {
        throw new Error("useTikTokMonitor must be used within a TikTokMonitorProvider");
    }
    return context;
} 