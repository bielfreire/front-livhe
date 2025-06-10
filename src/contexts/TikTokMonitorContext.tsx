import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import TikTokMonitor from "@/components/TikTokMonitor";
import { useProfile } from "@/hooks/use-profile";

interface TikTokMonitorContextType {
    username: string;
    isMonitoring: boolean;
    showMonitor: boolean;
    startMonitoring: (username: string, moodId?: string) => void;
    stopMonitoring: () => void;
    closeMonitor: () => void;
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

    return (
        <TikTokMonitorContext.Provider
            value={{
                username,
                isMonitoring,
                showMonitor,
                startMonitoring,
                stopMonitoring,
                closeMonitor,
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