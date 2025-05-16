import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from "@/utils/api";
import { Gift, Heart, Share2, MessageSquare, UserPlus } from "lucide-react";

interface Preset {
    id: number;
    name: string;
    action: string;
    active: boolean;
    giftImageUrl?: string;
    giftName?: string;
    soundUrl?: string;
    commandName?: string;
    commandImageUrl?: string;
    mood: {
        id: number;
    };
    trigger: string;
    game: {
        id: number;
    };
    keybind?: string; // Adicionado campo keybind
}

const PresetOverlay = () => {
    const [presets, setPresets] = useState<Preset[]>([]);
    const { moodId, gameId } = useParams();

    useEffect(() => {
        const fetchPresets = async () => {
            try {
                const response = await apiRequest("/presets", { method: "GET", isAuthenticated: true });
                const activePresets = response.filter(
                    (p: Preset) => p.active && p.mood?.id === Number(moodId) && p.game?.id === Number(gameId)
                );
                setPresets(activePresets);
            } catch (error) {
                console.error("Erro ao buscar presets:", error);
            }
        };

        fetchPresets();
    }, [moodId, gameId]);

    const getIconForTrigger = (trigger: string) => {
        switch (trigger) {
            case "likes":
                return <Heart size={32} className="text-pink-500" />;
            case "subscribe":
                return <UserPlus size={32} className="text-purple-500" />;
            case "share":
                return <Share2 size={32} className="text-blue-500" />;
            case "chat":
                return <MessageSquare size={32} className="text-green-500" />;
            case "follow":
                return <UserPlus size={32} className="text-orange-500" />;
            default:
                return <Gift size={32} className="text-yellow-500" />;
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
            <div className="grid grid-cols-7 gap-4 p-4">
                {presets.map((preset) => (
                    <div key={preset.id} className="flex flex-col items-center">
                        <div className="text-center text-white mb-2">1x</div>
                        <div className="relative w-24 h-24 mb-2">
                            {preset.trigger === "gift" && preset.giftImageUrl ? (
                                <img
                                    src={preset.giftImageUrl}
                                    alt={preset.giftName || "Gift"}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="flex justify-center items-center w-full h-full bg-gray-700 rounded">
                                    {getIconForTrigger(preset.trigger)}
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-white text-sm font-medium">{preset.giftName || preset.commandName}</div>
                            <div className="text-yellow-400 text-xs">{preset.action}</div>
                            <div className="text-center text-white text-xs">{preset.keybind}</div> {/* Exibe a tecla de atalho */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export { PresetOverlay };