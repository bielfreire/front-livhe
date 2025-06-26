import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from "@/utils/api";
import { Gift, Heart, Share2, MessageSquare, UserPlus, Send  } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

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
    likesCount?: number;
}

const PresetOverlay = () => {
    const [presets, setPresets] = useState<Preset[]>([]);
    const { moodId, gameId } = useParams();
    const { profile } = useProfile();

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

    useEffect(() => {
        fetchPresets();
    }, [moodId, gameId]);

    useEffect(() => {
        // WebSocket connection for real-time updates
        if (!profile || !moodId || !gameId) return;

        const socket = new WebSocket('ws://localhost:4000');

        socket.onopen = () => {
            console.log('WebSocket conectado para atualizações de presets');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Verificar se a mensagem é sobre presets e se é para este usuário/mood/game
                if (data.type && ['preset-update', 'preset-created', 'preset-deleted', 'preset-order-updated'].includes(data.type)) {
                    if (data.userId === profile.id && data.gameId === Number(gameId) && data.moodId === Number(moodId)) {
                        console.log('Atualização de preset detectada, recarregando...');
                        fetchPresets();
                    }
                }
            } catch (error) {
                console.error('Erro ao processar mensagem WebSocket:', error);
            }
        };

        socket.onerror = (error) => {
            console.error('Erro na conexão WebSocket:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket desconectado');
        };

        // Cleanup on unmount
        return () => {
            socket.close();
        };
    }, [profile, moodId, gameId]);

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

    const hasManyPresets = presets.length >= 6;

    const renderPresetItem = (preset: Preset, key: string) => (
        <div key={key} className={`
            flex flex-col items-center
            ${hasManyPresets ? 'min-w-[120px] flex-shrink-0' : ''}
        `}>
            <div className="text-center text-white mb-2">1x</div>
            <div className="relative w-24 h-24 mb-2">
                {preset.trigger === "gift" && preset.giftImageUrl ? (
                    <img
                        src={preset.giftImageUrl}
                        alt={preset.giftName || "Gift"}
                        className="w-full h-full object-contain"
                    />
                ) : preset.trigger === "likes" ? (
                    <span className="preset-icon-heart-wrapper">
                        <img
                            src="https://img.icons8.com/?size=100&id=99981&format=png&color=FF0000"
                            alt="Curtidas"
                            className="w-full h-full object-contain"
                        />
                        {preset.likesCount ? (
                            <span className="likes-badge">{preset.likesCount}</span>
                        ) : null}
                    </span>
                ) : (
                    <div className="flex justify-center items-center w-full h-full bg-gray-700 rounded">
                        {getIconForTrigger(preset.trigger)}
                    </div>
                )}
            </div>
            <div className="text-center">
                <div className="text-white text-sm font-medium truncate max-w-[100px]">
                    {preset.giftName || preset.commandName}
                </div>
                <div className="text-yellow-400 text-xs truncate max-w-[100px]">
                    {preset.action}
                </div>
                <div className="text-center text-white text-xs">
                    {preset.keybind}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
            <div className={`
                flex gap-4 p-4 
                ${hasManyPresets 
                    ? 'overflow-x-auto overflow-y-hidden justify-start px-4' 
                    : 'grid grid-cols-7 justify-center'
                }
                max-w-full
                scrollbar-hide
            `}>
                {hasManyPresets ? (
                    <div className="carousel-inner">
                        {/* Primeira sequência de presets */}
                        {presets.map((preset) => renderPresetItem(preset, `first-${preset.id}`))}
                        {/* Segunda sequência de presets (duplicada para carrossel infinito) */}
                        {presets.map((preset) => renderPresetItem(preset, `second-${preset.id}`))}
                    </div>
                ) : (
                    presets.map((preset) => renderPresetItem(preset, `single-${preset.id}`))
                )}
            </div>

            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                /* Animação de carrossel infinito */
                @keyframes carousel {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                
                .carousel-inner {
                    display: flex;
                    gap: 1rem;
                    animation: carousel 30s linear infinite;
                }
                
                .carousel-inner:hover {
                    animation-play-state: paused;
                }
                .preset-icon-heart-wrapper {
                    position: relative;
                    display: inline-block;
                    width: 100%;
                    height: 100%;
                }
                .preset-icon-heart-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    display: block;
                }
                .likes-badge {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #fff;
                    font-size: 1.2em;
                    font-weight: bold;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
};

export { PresetOverlay };