import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Minimize2, Maximize2 } from "lucide-react";

interface TikTokMonitorProps {
    username: string;
    isMonitoring: boolean;
    onClose: () => void;
}

const TikTokMonitor = ({ username, isMonitoring, onClose }: TikTokMonitorProps) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        if (isMonitoring) {
            setMessages([
                `🔴 Monitorando live de ${username}`,
                "📊 Monitorando:",
                "• Comentários",
                "• Gifts",
                "• Likes",
                "• Seguidores",
                "• Compartilhamentos"
            ]);
        } else {
            setMessages([
                "❌ Monitoramento encerrado"
            ]);
        }
    }, [isMonitoring, username]);

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <Card className="bg-[#222429] border-none p-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-white text-sm">@ {username}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMinimized(false)}
                            className="h-6 w-6"
                        >
                            <Maximize2 className="h-4 w-4 text-white" />
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 z-50">
            <Card className="bg-[#222429] border-none">
                <div className="flex items-center justify-between p-2 border-b border-[#2A2D36]">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-white text-sm">@ {username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMinimized(true)}
                            className="h-6 w-6"
                        >
                            <Minimize2 className="h-4 w-4 text-white" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-6 w-6"
                        >
                            <X className="h-4 w-4 text-white" />
                        </Button>
                    </div>
                </div>
                <div className="h-64 overflow-y-auto p-4">
                    {messages.map((message, index) => (
                        <div 
                            key={index} 
                            className={`text-sm mb-2 ${
                                message.includes("🔴") || message.includes("❌") 
                                    ? "text-yellow-400" 
                                    : "text-white"
                            }`}
                        >
                            {message}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default TikTokMonitor; 