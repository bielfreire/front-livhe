import { createContext, useContext, useState, ReactNode } from "react";
import TikTokMonitor from "@/components/TikTokMonitor";

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
    const [username, setUsername] = useState("");
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [showMonitor, setShowMonitor] = useState(false);

    const startMonitoring = (newUsername: string, moodId?: string) => {
        setUsername(newUsername);
        setIsMonitoring(true);
        setShowMonitor(true);
    };

    const stopMonitoring = () => {
        setIsMonitoring(false);
        setShowMonitor(false);
    };

    const closeMonitor = () => {
        setShowMonitor(false);
        setIsMonitoring(false);
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
            {showMonitor && (
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