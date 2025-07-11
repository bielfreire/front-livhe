import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/hooks/use-profile";
import { useTikTokMonitor } from "@/contexts/TikTokMonitorContext";
import TikTokMonitor from "@/components/TikTokMonitor";
import { useTranslation } from "react-i18next";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/utils/api";
import { Gift, Music, Gamepad2, Play, StopCircle, Loader2, Heart, Share2, MessageSquare, UserPlus, FolderOpen, X, Copy, Eye, GripVertical } from "lucide-react";
import { GiftSelector } from "@/components/GiftSelector";
import { SoundSelector } from "@/components/SoundSelector";
import { GameCommandSelector } from "@/components/GameCommandSelector";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { ClearableInput } from "@/components/ui/clearable-input";
import Breadcrumb from "@/components/Breadcrumb"; // Importando o componente Breadcrumb
import GtaStatusCard from "@/components/GtaStatusCard";


interface Game {
    id: number;
    name: string;
    imageUrl: string;
}

interface Mood {
    id: number;
    name: string;
    imageUrl: string;
}

interface Preset {
    active: boolean;
    id: number;
    name: string;
    action: string;
    keybind: string;
    delay: number;
    enabled: boolean;
    giftName?: string;
    giftImageUrl?: string;
    soundTitle?: string;
    soundUrl?: string;
    commandName?: string;
    commandDescription?: string;
    commandImageUrl?: string;
    trigger?: string;
    triggerImageUrl?: string;
    chatWord?: string;
    likesCount?: number;
    videoUrl?: string;
    order?: number;
}

interface Trigger {
    id: number;
    name: string;
    imageUrl: string | null;
    filePath: string;
}

interface CountdownOverlayProps {
    seconds: number;
    presetName: string;
    onCancel: () => void;
}

interface SortableRowProps {
    preset: Preset;
    game: Game | null;
    isSoundPlaying: number | null;
    countdown: number | null;
    disableActions: boolean;
    handleEdit: (preset: Preset) => void;
    handleCopyPreset: (preset: Preset) => void;
    handleConfirmDelete: (presetId: number) => void;
    handleTestPreset: (preset: Preset) => void;
    handleEnableChange: (presetId: number, active: boolean) => void;
    t: (key: string) => string;
}

const CountdownOverlay = ({ seconds, presetName, onCancel }: CountdownOverlayProps) => {
    const isZero = seconds === 0;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-[#222429] p-8 rounded-lg shadow-2xl text-center max-w-md w-full mx-4">
                <h3 className="text-white text-xl font-bold mb-4">{presetName}</h3>
                <div className="relative w-32 h-32 mx-auto mb-6">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                            className="text-gray-700"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="44"
                            cx="50"
                            cy="50"
                        />
                        <circle
                            className={`${isZero ? 'text-red-500' : 'text-[#FFD110]'} transition-colors duration-300`}
                            strokeWidth="8"
                            strokeDasharray={276.46}
                            strokeDashoffset={276.46 - (276.46 * seconds) / 10}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="44"
                            cx="50"
                            cy="50"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-4xl font-bold ${isZero ? 'text-red-500 animate-bounce' : 'text-white'}`}>
                            {isZero ? 'JÁ!' : `${seconds}s`}
                        </span>
                    </div>
                </div>
                <p className={`text-gray-400 mb-6 ${isZero ? 'animate-pulse' : ''}`}>
                    {isZero ? 'Executando ação...' : `Ação será executada em ${seconds} segundos`}
                </p>
                <Button
                    onClick={onCancel}
                    className="bg-red-500 hover:bg-red-600 text-white"
                >
                    Cancelar
                </Button>
            </div>
        </div>
    );
};

const SortableRow = ({
    preset,
    game,
    isSoundPlaying,
    countdown,
    disableActions,
    handleEdit,
    handleCopyPreset,
    handleConfirmDelete,
    handleTestPreset,
    handleEnableChange,
    t
}: SortableRowProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: preset.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className="border-b border-[#2A2D36] hover:bg-[#2A2D36]/50"
        >
            <td className="px-4 py-2">
                <div className="flex items-center space-x-2">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-200 p-2 rounded hover:bg-[#3A3D46] transition-colors duration-200"
                        title="Arrastar para reordenar"
                    >
                        <GripVertical size={18} />
                    </button>
                    <Switch
                        checked={preset.active}
                        onCheckedChange={(value) => handleEnableChange(preset.id, value)}
                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-500"
                        disabled={disableActions}
                    />
                </div>
            </td>
            <td className="px-4 py-2 whitespace-nowrap">
                {game?.name?.toLowerCase().includes('gta') 
                    ? preset.name 
                    : preset.action
                }
            </td>
            <td className="px-4 py-2">
                {preset.trigger ? (
                    <div className="flex items-center space-x-2">
                        {preset.trigger === 'gift' ? (
                            preset.giftImageUrl ? (
                                <Avatar className="w-8 h-8">
                                    <AvatarImage
                                        src={preset.giftImageUrl}
                                        alt={preset.giftName || "Gift"}
                                    />
                                    <AvatarFallback>
                                        <Gift size={16} />
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <Gift size={16} className="text-gray-400" />
                            )
                        ) : preset.trigger === 'likes' ? (
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-red-500">
                                    <Heart size={16} className="text-white" />
                                </AvatarFallback>
                            </Avatar>
                        ) : preset.trigger === 'subscribe' ? (
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-purple-500">
                                    <UserPlus size={16} className="text-white" />
                                </AvatarFallback>
                            </Avatar>
                        ) : preset.trigger === 'share' ? (
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-blue-500">
                                    <Share2 size={16} className="text-white" />
                                </AvatarFallback>
                            </Avatar>
                        ) : preset.trigger === 'chat' ? (
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-green-500">
                                    <MessageSquare size={16} className="text-white" />
                                </AvatarFallback>
                            </Avatar>
                        ) : preset.trigger === 'follow' ? (
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-orange-500">
                                    <UserPlus size={16} className="text-white" />
                                </AvatarFallback>
                            </Avatar>
                        ) : preset.triggerImageUrl ? (
                            <Avatar className="w-8 h-8">
                                <AvatarImage
                                    src={`http://localhost:4000/${preset.triggerImageUrl}`}
                                    alt={preset.trigger || "Trigger"}
                                />
                                <AvatarFallback>
                                    <Gift size={16} />
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <Gift size={16} className="text-gray-400" />
                        )}
                        <span>
                            {preset.trigger === 'gift'
                                ? preset.giftName || preset.keybind
                                : preset.trigger}
                        </span>
                    </div>
                ) : (
                    "-"
                )}
            </td>
            <td className="px-4 py-2">
                {preset.soundTitle && (
                    <div className="flex items-center space-x-2">
                        <Music size={16} className="text-blue-400" />
                        <span className="truncate max-w-[150px]" title={preset.soundTitle}>
                            {preset.soundTitle}
                        </span>
                    </div>
                )}
            </td>
            <td className="px-4 py-2 whitespace-nowrap">{preset.keybind || "-"}</td>
            <td className="px-4 py-2 whitespace-nowrap">{preset.delay > 0 ? `${preset.delay}s` : "-"}</td>
            <td className="px-4 py-2">
                {preset.videoUrl && (
                    <Button
                        onClick={() => {
                            // URL para exibição e cópia inclui .livhe
                            const displayUrl = `http://localhost:4000/presets/overlay/${preset.id}.livhe`;
                            navigator.clipboard.writeText(displayUrl);
                            toast({
                                title: t('moods.presetConfig.urlCopied'),
                                description: t('moods.presetConfig.overlayUrlCopied'),
                                duration: 3000,
                            });
                        }}
                        className="bg-[#3A3D46] hover:bg-[#4A4D56] text-white"
                    >
                        <Copy size={16} className="mr-1" />
                        {t('moods.presetConfig.copyOverlayUrl')}
                    </Button>
                )}
            </td>
            <td className="px-4 py-2">
                <Button
                    onClick={() => handleTestPreset(preset)}
                    className={`w-10 h-10 p-0 rounded-full ${isSoundPlaying === preset.id ? "bg-red-500 hover:bg-red-600" : "bg-yellow-400 hover:bg-yellow-500"
                        } text-black relative`}
                    disabled={!preset.active}
                >
                    {isSoundPlaying === preset.id ? (
                        <>
                            <StopCircle size={20} />
                            {countdown !== null && (
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-sm">
                                    {countdown}s
                                </div>
                            )}
                        </>
                    ) : (
                        <Play size={20} />
                    )}
                </Button>
            </td>
            <td className="px-4 py-2 flex flex-wrap gap-2">
                <Button
                    onClick={() => handleEdit(preset)}
                    className="bg-blue-500 text-white w-20"
                    disabled={disableActions}
                >
                    {t('moods.presetConfig.edit')}
                </Button>
                <Button
                    onClick={() => handleCopyPreset(preset)}
                    className="bg-green-500 text-white w-10 h-10 p-0"
                    disabled={disableActions}
                    title={t('moods.presetConfig.copy')}
                >
                    <Copy size={16} />
                </Button>
                <Button
                    onClick={() => handleConfirmDelete(preset.id)}
                    className="bg-red-500 text-white w-20"
                >
                    {t('moods.presetConfig.delete')}
                </Button>
            </td>
        </tr>
    );
};

const MoodPresetConfig = () => {
    const { t } = useTranslation();
    const { moodId, gameId } = useParams();
    const navigate = useNavigate();
    const { profile } = useProfile();
    const { startMonitoring, stopMonitoring, isMonitoring } = useTikTokMonitor();
    const [game, setGame] = useState<Game | null>(null);
    const [mood, setMood] = useState<Mood | null>(null);
    const [presets, setPresets] = useState<Preset[]>([]);
    const [presetData, setPresetData] = useState({
        name: "",
        action: "",
        keybind: "",
        delay: 0,
        giftName: "",
        giftImageUrl: "",
        soundTitle: "",
        soundUrl: "",
        commandName: "",
        commandDescription: "",
        commandImageUrl: "",
        chatWord: "",
        likesCount: 0,
        videoUrl: "",
    });
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [presetToDelete, setPresetToDelete] = useState<number | null>(null);
    const [presetId, setPresetId] = useState<number | null>(null);
    const [showGiftSelector, setShowGiftSelector] = useState(false);
    const [showSoundSelector, setShowSoundSelector] = useState(false);
    const [showGameCommandSelector, setShowGameCommandSelector] = useState(false);
    const [giftError, setGiftError] = useState(false);
    const [showLimitDialog, setShowLimitDialog] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [username, setUsername] = useState(() => {
        const savedUsername = localStorage.getItem('tiktok_monitor_username');
        return savedUsername || "";
    });
    const [showMonitor, setShowMonitor] = useState(false);
    const [triggers, setTriggers] = useState<Trigger[]>([]);
    const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);
    const [showTriggerSelector, setShowTriggerSelector] = useState(false);
    const [serverPath, setServerPath] = useState("");
    const [isServerRunning, setIsServerRunning] = useState(false);
    const [isServerLoading, setIsServerLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [testingPreset, setTestingPreset] = useState<number | null>(null);
    const [isSoundPlaying, setIsSoundPlaying] = useState<number | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [countdownPreset, setCountdownPreset] = useState<Preset | null>(null);
    const [videoInputType, setVideoInputType] = useState<'url' | 'upload'>('url');
    const videoFileInputRef = useRef<HTMLInputElement>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [limitDialogMessage, setLimitDialogMessage] = useState("");
    const [isAlertExpanded, setIsAlertExpanded] = useState(false);
    const [showOverlayPreview, setShowOverlayPreview] = useState(false);
    const [gtaStatus, setGtaStatus] = useState<any>(null);
    const [gtaLoading, setGtaLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiRequest("/services", { method: "GET", isAuthenticated: true });
                const triggersResponse = await apiRequest("/triggers", { method: "GET", isAuthenticated: true });
                setTriggers(triggersResponse);

                const selectedGame = response.find((g: Game) => g.id === Number(gameId));
                if (selectedGame) {
                    setGame(selectedGame);
                    const selectedMood = selectedGame.moods.find((m: Mood) => m.id === Number(moodId));
                    if (selectedMood) setMood(selectedMood);
                }

                const presetsResponse = await apiRequest("/presets", { method: "GET", isAuthenticated: true });
                const filteredPresets = presetsResponse.filter(
                    (p: any) => p.mood.id === Number(moodId) && p.game.id === Number(gameId)
                );
                setPresets(filteredPresets);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchData();
    }, [gameId, moodId]);

    useEffect(() => {
        if (profile?.account) {
            // Only set the username from profile if there's no active monitoring
            if (!isMonitoring) {
                setUsername(profile.account);
            }
        }
    }, [profile, isMonitoring]);

    // Add effect to show monitor if there's an active monitoring
    useEffect(() => {
        const isMonitoring = localStorage.getItem('tiktok_monitor_status') === 'true';
        if (isMonitoring) {
            setShowMonitor(true);
        }
    }, []);

    useEffect(() => {
        if (game?.name?.toLowerCase().includes('gta')) {
            setGtaLoading(true);
            apiRequest('/gtav/status', { method: 'GET', isAuthenticated: true })
                .then(setGtaStatus)
                .finally(() => setGtaLoading(false));
        }
    }, [game]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPresetData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleClearField = (fieldName: string) => {
        setPresetData(prev => ({
            ...prev,
            [fieldName]: ""
        }));
    };

    const handleEdit = (preset: Preset) => {
        setPresetId(preset.id);

        // Verifica se o vídeo é do Cloudinary
        const isCloudinaryVideo = preset.videoUrl?.includes('cloudinary.com');

        setVideoInputType(isCloudinaryVideo ? 'upload' : 'url');
        setVideoFile(isCloudinaryVideo ? new File([], 'video.mp4') : null);

        setPresetData({
            name: preset.name,
            action: preset.action,
            keybind: preset.keybind,
            delay: preset.delay,
            giftName: preset.giftName || "",
            giftImageUrl: preset.giftImageUrl || "",
            soundTitle: preset.soundTitle || "",
            soundUrl: preset.soundUrl || "",
            commandName: preset.commandName || "",
            commandDescription: preset.commandDescription || "",
            commandImageUrl: preset.commandImageUrl || "",
            chatWord: preset.chatWord || "",
            likesCount: preset.likesCount || 0,
            videoUrl: isCloudinaryVideo ? "" : preset.videoUrl || "",
        });

        // Encontrar e definir o trigger correspondente
        const matchingTrigger = triggers.find(t => t.name === preset.trigger);
        if (matchingTrigger) {
            setSelectedTrigger(matchingTrigger);
        }

        setShowModal(true);
    };

    const handleOpenConfirmDialog = (e: React.FormEvent) => {
        e.preventDefault();

        // Verifica se o usuário tem plano free e já atingiu o limite de 1 vídeo de overlay
        const overlayCount = presets.filter(p => p.videoUrl).length;
        if (profile?.plan === 'free' && overlayCount >= 1 && presetData.videoUrl) {
            setShowLimitDialog(true);
            setLimitDialogMessage("O plano free permite apenas 1 vídeo de overlay. Atualize para o plano premium para adicionar mais vídeos de overlay ou remova o existente.");
            return;
        }

        if (profile?.plan === 'free' && presets.length >= 5) {
            setShowLimitDialog(true);
            setLimitDialogMessage("O plano free permite apenas 5 Ações. Atualize para o plano premium para criar mais Ações ou exclua uma ação existente.");
            return;
        }

        setShowConfirmDialog(true);
    };

    const handleConfirmDelete = (presetId: number) => {
        setPresetToDelete(presetId);
        setShowDeleteConfirm(true);
    };

    const handleSelectTrigger = (trigger: Trigger) => {
        setSelectedTrigger(trigger);
        setShowTriggerSelector(false);
        if (trigger.name === 'gift') {
            setShowGiftSelector(true);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setGiftError(false);

        try {
            let videoUrl = presetData.videoUrl;

            // Só faz o upload se houver um novo arquivo de vídeo selecionado
            if (videoFile && videoInputType === 'upload' && videoFile.name !== 'video.mp4') {
                setIsUploading(true);
                try {
                    const formData = new FormData();
                    formData.append('file', videoFile);

                    const uploadResponse = await apiRequest('/presets/upload-video', {
                        method: 'POST',
                        body: formData,
                        isAuthenticated: true,
                    });

                    if (uploadResponse && uploadResponse.videoUrl) {
                        videoUrl = uploadResponse.videoUrl;
                    } else {
                        throw new Error('Não foi possível obter a URL do vídeo');
                    }
                } catch (error) {
                    console.error("Erro ao fazer upload do vídeo:", error);
                    const errorMessage = error.response?.data?.message || error.message || "Não foi possível fazer o upload do vídeo. Tente novamente.";
                    toast({
                        title: "Erro",
                        description: errorMessage,
                        variant: "destructive",
                        duration: 6000,
                    });
                    setLoading(false);
                    setIsUploading(false);
                    return;
                } finally {
                    setIsUploading(false);
                }
            } else if (videoInputType === 'upload' && presetId) {
                // Se estiver editando e o tipo for upload, mantém a URL do vídeo existente
                const existingPreset = presets.find(p => p.id === presetId);
                if (existingPreset?.videoUrl) {
                    videoUrl = existingPreset.videoUrl;
                }
            }

            // Agora que temos a URL do vídeo (seja do upload ou da URL direta), podemos salvar o preset
            const payload = {
                name: presetData.name,
                action: presetData.action,
                keybind: presetData.keybind,
                delay: presetData.delay,
                giftName: presetData.giftName,
                giftImageUrl: presetData.giftImageUrl,
                soundTitle: presetData.soundTitle,
                soundUrl: presetData.soundUrl,
                commandName: presetData.commandName,
                commandDescription: presetData.commandDescription,
                commandImageUrl: presetData.commandImageUrl,
                trigger: selectedTrigger?.name || null,
                triggerImageUrl: selectedTrigger?.name === 'gift' ? presetData.giftImageUrl : selectedTrigger?.filePath || null,
                chatWord: presetData.chatWord,
                likesCount: presetData.likesCount,
                videoUrl: videoUrl,
            };

            let response;
            if (presetId) {
                response = await apiRequest(`/presets/${presetId}`, {
                    method: "PATCH",
                    body: payload,
                    headers: { "Content-Type": "application/json" },
                    isAuthenticated: true,
                });

                if (response) {
                    setPresets((prev) =>
                        prev.map((p) => (p.id === presetId ? { ...p, ...payload } : p))
                    );
                }
            } else {
                response = await apiRequest("/presets", {
                    method: "POST",
                    body: {
                        serviceId: Number(gameId),
                        moodId: Number(moodId),
                        ...payload,
                    },
                    headers: { "Content-Type": "application/json" },
                    isAuthenticated: true,
                });

                if (response) {
                    const newPreset = {
                        ...response,
                        ...payload,
                    };
                    setPresets((prev) => [...prev, newPreset]);
                }
            }

            setPresetData({
                name: "",
                action: "",
                keybind: "",
                delay: 0,
                giftName: "",
                giftImageUrl: "",
                soundTitle: "",
                soundUrl: "",
                commandName: "",
                commandDescription: "",
                commandImageUrl: "",
                chatWord: "",
                likesCount: 0,
                videoUrl: "",
            });
            setVideoFile(null);
            setSelectedTrigger(null);
            setPresetId(null);
            setShowModal(false);
            setShowConfirmDialog(false);
        } catch (error) {
            console.error("Erro ao salvar preset:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (presetToDelete === null) return;

        try {
            await apiRequest(`/presets/${presetToDelete}`, {
                method: "DELETE",
                isAuthenticated: true,
            });

            setPresets((prev) => prev.filter((preset) => preset.id !== presetToDelete));
            setShowDeleteConfirm(false);
            setPresetToDelete(null);
        } catch (error) {
            console.error("Erro ao deletar preset:", error);
        }
    };

    const handleEnableChange = async (presetId: number, active: boolean) => {

        // Atualiza localmente para refletir imediatamente na interface
        setPresets((prev) =>
            prev.map((preset) =>
                preset.id === presetId ? { ...preset, active } : preset
            )
        );
        try {
            const response = await apiRequest(`/presets/${presetId}`, {
                method: "PATCH",
                body: { active },
                headers: { "Content-Type": "application/json" },
                isAuthenticated: true,
            });

            if (response) {
                setPresets((prev) =>
                    prev.map((preset) =>
                        preset.id === presetId ? { ...preset, enabled: response.enabled } : preset
                    )
                );
            }
        } catch (error) {
            console.error("Erro ao atualizar status do preset:", error);
        }
    };

    const handleSelectGift = (giftInfo: { id: string, name: string, imageUrl: string }) => {
        setPresetData(prevData => ({
            ...prevData,
            giftName: giftInfo.name,
            giftImageUrl: giftInfo.imageUrl
        }));
    };

    const handleSelectSound = (soundInfo: { title: string, directUrl: string }) => {
        setPresetData(prevData => ({
            ...prevData,
            soundTitle: soundInfo.title,
            soundUrl: soundInfo.directUrl
        }));
    };

    const handleSelectCommand = (commandInfo: { name: string; command: string; description: string; imgUrl: string }) => {
        setPresetData(prevData => ({
            ...prevData,
            action: commandInfo.command,
            commandName: commandInfo.name,
            commandDescription: commandInfo.description,
            commandImageUrl: commandInfo.imgUrl
        }));
    };

    const handleToggleMonitoring = async () => {
        try {
            setIsConnecting(true);
            if (!isMonitoring) {
                // Start monitoring
                await apiRequest(`/tiktok/monitor?username=${username}&moodId=${moodId}`, {
                    method: "POST",
                    isAuthenticated: true,
                });
                startMonitoring(username, moodId);
                toast({
                    title: "Sucesso",
                    description: `Monitoramento iniciado para ${username}`,
                    duration: 6000,
                });
            } else {
                // Stop monitoring
                await apiRequest(`/tiktok/monitor?username=${username}`, {
                    method: "DELETE",
                    isAuthenticated: true,
                });
                stopMonitoring();
                toast({
                    title: "Sucesso",
                    description: `Monitoramento encerrado para ${username}`,
                    duration: 6000,
                });
            }
        } catch (error) {
            console.error("Erro ao alternar monitoramento:", error);

            // Handle different HTTP status codes
            if (error.response?.status === 404) {
                toast({
                    title: "Erro",
                    description: "Usuário não encontrado ou não está em live. Verifique se o nome de usuário está correto e se a live está ativa.",
                    variant: "destructive",
                    duration: 6000,
                });
            } else if (error.response?.status === 400) {
                toast({
                    title: "Erro",
                    description: error.response.data.message || "Parâmetros inválidos",
                    variant: "destructive",
                    duration: 6000,
                });
            } else {
                toast({
                    title: "Erro",
                    description: error.response?.data?.message || error.message || "Erro ao monitorar a live",
                    variant: "destructive",
                    duration: 6000,
                });
            }

            // If we were trying to start monitoring, make sure to stop it
            if (!isMonitoring) {
                stopMonitoring();
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const handleStartServer = async () => {
        try {
            setIsServerLoading(true);
            await apiRequest("/server/start", {
                method: "POST",
                body: { serverPath },
                isAuthenticated: true,
            });
            setIsServerRunning(true);
            toast({
                title: "Sucesso",
                description: "Servidor iniciado com sucesso!",
                duration: 6000,

            });
        } catch (error) {
            console.error("Erro ao iniciar servidor:", error);
            toast({
                title: "Erro",
                description: "Não foi possível iniciar o servidor. Inicie o Aplicativo como administrador.",
                variant: "destructive",
            });
        } finally {
            setIsServerLoading(false);
        }
    };

    const handleStopServer = async () => {
        try {
            setIsServerLoading(true);
            await apiRequest("/server/stop", {
                method: "POST",
                isAuthenticated: true,
            });
            setIsServerRunning(false);
            toast({
                title: "Sucesso",
                description: "Servidor parado com sucesso!",
                duration: 6000,
            });
        } catch (error) {
            setIsServerRunning(false);

            // Mensagem padrão de erro
            let errorMessage = "O servidor já está fechado ou não foi iniciado.";

            // Verifica se o erro é porque o servidor já está parado ou não iniciado
            const knownMessages = [
                "Nenhum servidor está em execução",
                "não está em execução",
                "Não foi possível encontrar o servidor",
                "Falha ao parar o servidor: Nenhum servidor está em execução para este usuário"
            ];

            if (
                error.message &&
                knownMessages.some(msg => error.message.includes(msg))
            ) {
                errorMessage = "O servidor já está fechado ou não foi iniciado.";
            }

            toast({
                title: "Aviso",
                description: errorMessage,
                variant: "destructive",
                duration: 6000,
            });
        } finally {
            setIsServerLoading(false);
        }
    };


    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Usa o caminho completo do arquivo
            const fullPath = (file as any).path;
            setServerPath(fullPath);
        }
    };

    const handleOpenFilePicker = () => {
        fileInputRef.current?.click();
    };

    const handleClearSound = () => {
        setPresetData(prev => ({
            ...prev,
            soundTitle: "",
            soundUrl: ""
        }));
    };

    const handleClearTrigger = () => {
        setSelectedTrigger(null);
        setPresetData(prev => ({
            ...prev,
            giftName: "",
            giftImageUrl: "",
            keybind: "",
            chatWord: "",
            likesCount: 0
        }));
    };

    const handleTestPreset = async (preset: Preset) => {
        try {
            if (isSoundPlaying === preset.id) {
                // Para o som se já estiver tocando
                await apiRequest('/sounds/stop', {
                    method: 'POST',
                    isAuthenticated: true,
                });
                setIsSoundPlaying(null);
                setCountdown(null);
                setCountdownPreset(null);
                toast({
                    title: "Sucesso",
                    description: "Som parado com sucesso!",
                    duration: 6000,
                });
            } else {
                setIsSoundPlaying(preset.id);

                try {
                    // Se houver delay, mostra o countdown
                    if (preset.delay > 0) {
                        setCountdown(preset.delay);
                        setCountdownPreset(preset);
                        let actionStarted = false;

                        const countdownInterval = setInterval(() => {
                            setCountdown(prev => {
                                if (prev === null) return null;

                                // Quando chegar a 1, inicia a ação
                                if (prev === 2 && !actionStarted) {
                                    actionStarted = true;
                                    // Inicia a ação em background
                                    apiRequest(`/tester/preset/${preset.id}/test`, {
                                        method: "POST",
                                        isAuthenticated: true,
                                    }).catch(error => {
                                        console.error("Erro ao executar ação:", error);
                                    });
                                }

                                if (prev <= 0) {
                                    clearInterval(countdownInterval);
                                    return null;
                                }
                                return prev - 1;
                            });
                        }, 1000);

                        // Aguarda o delay completo para manter a animação
                        await new Promise(resolve => setTimeout(resolve, preset.delay * 1000));
                        clearInterval(countdownInterval);
                        setCountdown(null);
                        setCountdownPreset(null);
                    } else {
                        // Se não houver delay, executa a ação imediatamente
                        await apiRequest(`/tester/preset/${preset.id}/test`, {
                            method: "POST",
                            isAuthenticated: true,
                        });
                    }

                    toast({
                        title: "Sucesso",
                        description: "Preset testado com sucesso!",
                        duration: 6000,
                    });
                } catch (error) {
                    setIsSoundPlaying(null);
                    setCountdown(null);
                    setCountdownPreset(null);
                    throw error;
                }

                setIsSoundPlaying(null);
            }
        } catch (error) {
            setIsSoundPlaying(null);
            setCountdown(null);
            setCountdownPreset(null);
            console.error("Erro ao testar preset:", error);
            toast({
                title: "Erro",
                description: "Não foi possível testar o preset. Verifique se o servidor está rodando.",
                variant: "destructive",
                duration: 6000,
            });
        }
    };

    const handleCancelCountdown = async () => {
        if (countdownPreset) {
            await apiRequest('/sounds/stop', {
                method: 'POST',
                isAuthenticated: true,
            });
            setIsSoundPlaying(null);
            setCountdown(null);
            setCountdownPreset(null);
            toast({
                title: "Cancelado",
                description: "Ação cancelada com sucesso!",
                duration: 6000,
            });
        }
    };

    const handleVideoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
            // Não fazemos o upload imediatamente, apenas armazenamos o arquivo
        }
    };

    const handleOpenVideoFilePicker = () => {
        videoFileInputRef.current?.click();
    };

    // Limites do plano
    const isFree = profile?.plan === 'free';
    const maxPresets = isFree ? 5 : 50;
    const maxOverlayVideos = isFree ? 1 : 50;
    const overPresetLimit = isFree && presets.length > 5;
    const overOverlayLimit = isFree && presets.filter(p => p.videoUrl).length > 1;

    // Desabilitar ações se acima do limite
    const disableActions = overPresetLimit || overOverlayLimit;

    // Ajustar o listener global para detectar combinações de teclas de forma padronizada
    useEffect(() => {
        if (disableActions) return; // Bloqueia atalhos se exceder limite
        const handleKeyDown = (event: KeyboardEvent) => {
            // Excluir teclas espaço e backspace
            if (event.code === 'Space' || event.code === 'Backspace') {
                return;
            }

            let combo = [];
            if (event.ctrlKey) combo.push('Ctrl');
            if (event.altKey) combo.push('Alt');
            if (event.shiftKey) combo.push('Shift');
            if (event.metaKey) combo.push('Meta');
            let mainKey = '';
            if (event.code.startsWith('Key')) {
                mainKey = event.code.replace('Key', '').toUpperCase();
            } else if (event.code.startsWith('Digit')) {
                mainKey = event.code.replace('Digit', '');
            } else if (event.code.startsWith('Numpad')) {
                const num = event.code.replace('Numpad', '');
                mainKey = /^\d+$/.test(num) ? `Num${num}` : `Num${num}`;
            } else {
                mainKey = event.code;
            }
            combo.push(mainKey);
            const pressed = combo.join('+');
            const preset = presets.find(p => p.keybind === pressed);
            if (preset) {
                handleTestPreset(preset);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [presets, disableActions]);

    const handleClearForm = () => {
        setPresetData({
            name: "",
            action: "",
            keybind: "",
            delay: 0,
            giftName: "",
            giftImageUrl: "",
            soundTitle: "",
            soundUrl: "",
            commandName: "",
            commandDescription: "",
            commandImageUrl: "",
            chatWord: "",
            likesCount: 0,
            videoUrl: "",
        });
        setSelectedTrigger(null);
        setPresetId(null);
        setVideoFile(null);
        setVideoInputType('url');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        handleClearForm();
    };

    const handleCopyPreset = async (preset: Preset) => {
        // Verifica se o usuário tem plano free e já atingiu o limite
        if (profile?.plan === 'free' && presets.length >= 5) {
            setShowLimitDialog(true);
            setLimitDialogMessage("O plano free permite apenas 5 Ações. Atualize para o plano premium para criar mais Ações ou exclua uma ação existente.");
            return;
        }

        // Verifica se o usuário tem plano free e já atingiu o limite de 1 vídeo de overlay
        const overlayCount = presets.filter(p => p.videoUrl).length;
        if (profile?.plan === 'free' && overlayCount >= 1 && preset.videoUrl) {
            setShowLimitDialog(true);
            setLimitDialogMessage("O plano free permite apenas 1 vídeo de overlay. Atualize para o plano premium para adicionar mais vídeos de overlay ou remova o existente.");
            return;
        }

        try {
            // Prepara os dados do preset copiado
            const payload = {
                name: `${preset.name} (Cópia)`,
                action: preset.action,
                keybind: preset.keybind,
                delay: preset.delay,
                giftName: preset.giftName,
                giftImageUrl: preset.giftImageUrl,
                soundTitle: preset.soundTitle,
                soundUrl: preset.soundUrl,
                commandName: preset.commandName,
                commandDescription: preset.commandDescription,
                commandImageUrl: preset.commandImageUrl,
                trigger: preset.trigger,
                triggerImageUrl: preset.triggerImageUrl,
                chatWord: preset.chatWord,
                likesCount: preset.likesCount,
                videoUrl: preset.videoUrl,
            };

            // Cria o novo preset diretamente
            const response = await apiRequest("/presets", {
                method: "POST",
                body: {
                    serviceId: Number(gameId),
                    moodId: Number(moodId),
                    ...payload,
                },
                headers: { "Content-Type": "application/json" },
                isAuthenticated: true,
            });

            if (response) {
                const newPreset = {
                    ...response,
                    ...payload,
                };
                setPresets((prev) => [...prev, newPreset]);

                toast({
                    title: t('moods.presetConfig.presetCopied'),
                    description: t('moods.presetConfig.presetCopiedDescription'),
                    duration: 4000,
                });
            }
        } catch (error) {
            console.error("Erro ao copiar preset:", error);
            toast({
                title: "Erro",
                description: "Não foi possível copiar o preset. Tente novamente.",
                variant: "destructive",
                duration: 6000,
            });
        }
    };

    // Configuração dos sensores para drag-and-drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Função para lidar com o fim do drag-and-drop
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setPresets((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Atualiza a ordem no backend
                const presetOrders = newItems.map((preset, index) => ({
                    id: preset.id,
                    order: index
                }));

                // Envia a atualização para o backend
                apiRequest('/presets/order/update', {
                    method: 'PATCH',
                    body: { presetOrders },
                    headers: { 'Content-Type': 'application/json' },
                    isAuthenticated: true,
                }).catch(error => {
                    console.error('Erro ao atualizar ordem dos presets:', error);
                    toast({
                        title: "Erro",
                        description: "Não foi possível salvar a nova ordem dos presets.",
                        variant: "destructive",
                        duration: 6000,
                    });
                });

                return newItems;
            });
        }
    };

    const handleInstall = async (type: 'chaosmod' | 'scripthook' | 'gta') => {
        setGtaLoading(true);
        try {
            const result = await apiRequest(`/gtav/install-${type}`, { method: 'POST', isAuthenticated: true });
            const status = await apiRequest('/gtav/status', { method: 'GET', isAuthenticated: true });
            setGtaStatus(status);
            if (result && result.success === false && result.message && result.message.includes('Permissão negada ao gravar na pasta do GTA')) {
                toast({
                    title: 'Permissão negada',
                    description: 'Não foi possível instalar na pasta do GTA. Execute o aplicativo como administrador (clique com o botão direito e escolha "Executar como administrador").',
                    variant: 'destructive',
                    duration: 10000,
                });
            } else if (result && result.success === false) {
                toast({
                    title: 'Erro ao instalar',
                    description: result.message,
                    variant: 'destructive',
                    duration: 8000,
                });
            } else if (result && result.success) {
                toast({
                    title: 'Sucesso',
                    description: result.message,
                    duration: 6000,
                });
            }
        } finally {
            setGtaLoading(false);
        }
    };

    const handleUninstallAll = async () => {
        setGtaLoading(true);
        try {
            const result = await apiRequest('/gtav/uninstall-dependencies', { method: 'POST', isAuthenticated: true });
            const status = await apiRequest('/gtav/status', { method: 'GET', isAuthenticated: true });
            setGtaStatus(status);
            if (result && result.success === false && result.message && result.message.includes('Permissão negada ao remover arquivos')) {
                toast({
                    title: 'Permissão negada',
                    description: 'Não foi possível remover arquivos da pasta do GTA. Execute o aplicativo como administrador (clique com o botão direito e escolha "Executar como administrador").',
                    variant: 'destructive',
                    duration: 10000,
                });
            } else if (result && result.success === false) {
                toast({
                    title: 'Erro ao desinstalar',
                    description: result.message,
                    variant: 'destructive',
                    duration: 8000,
                });
            } else if (result && result.success) {
                toast({
                    title: 'Desinstalação concluída',
                    description: result.message,
                    duration: 6000,
                });
            }
        } finally {
            setGtaLoading(false);
        }
    };

    const handleSelectGtaFolder = async () => {
        if (window.electron && window.electron.selectDirectory) {
            const folderPath = await window.electron.selectDirectory();
            if (folderPath) {
                await apiRequest('/gtav/set-path', { method: 'POST', body: { path: folderPath }, isAuthenticated: true });
                const status = await apiRequest('/gtav/status', { method: 'GET', isAuthenticated: true });
                setGtaStatus(status);
            }
        }
    };

    const handleGtaFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Pega o diretório selecionado
            // @ts-ignore
            const folderPath = files[0].webkitRelativePath?.split('/')[0];
            if (folderPath) {
                await apiRequest('/gtav/set-path', { method: 'POST', body: { path: folderPath }, isAuthenticated: true });
                const status = await apiRequest('/gtav/status', { method: 'GET', isAuthenticated: true });
                setGtaStatus(status);
            }
        }
    };

    return (
        <Layout>
            <Breadcrumb
                items={[
                    { label: t('common.home'), path: "/home" },
                    { label: t('navigation.games'), path: "/games" },
                    { label: t('moods.title'), path: `/moods/${gameId}` },
                    { label: t('moods.presetConfig.title'), path: `/moods/${gameId}/mood/${moodId}/preset` },
                ]}
            />
            <div className="min-h-screen bg-[#1A1C24] p-6">
                {profile?.plan === 'free' && (
                    <div
                        className="bg-yellow-900/50 border border-yellow-500 text-yellow-200 p-4 rounded-lg mb-6 cursor-pointer transition-all duration-300"
                        onClick={() => setIsAlertExpanded(!isAlertExpanded)}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{t('plans.free.name')} - {t('plans.free.title')}</h3>
                            <svg
                                className={`w-5 h-5 transform transition-transform duration-300 ${isAlertExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${isAlertExpanded ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{t('plans.free.features.0')}</li>
                                <li>{t('plans.free.features.1')}</li>
                                <li>{t('plans.free.features.2')}</li>
                                <li>{t('plans.free.features.3')}</li>
                            </ul>
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm">
                                    {t('plans.free.upgradeMessage')}
                                </p>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/plans');
                                    }}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-black ml-4"
                                >
                                    {t('plans.choosePlan')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white text-2xl font-bold">{t('moods.presetConfig.title')}:</h2>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setShowOverlayPreview(true)}
                            className="bg-[#3A3D46] hover:bg-[#4A4D56] text-white"
                        >
                            <Eye size={16} className="mr-2" />
                            {t('moods.presetConfig.previewOverlay')}
                        </Button>
                        <Button
                            onClick={() => navigate(`/moods/${gameId}/mood/${moodId}/overlay`)}
                            className="bg-[#FFD110] hover:bg-[#E6C00F] text-black"
                        >
                            {t('moods.presetConfig.generateOverlayLink')}
                        </Button>
                    </div>
                </div>

                {game && mood && (
                    <Card className="bg-[#222429] border-none mb-6">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center">
                                <img
                                    src={mood.imageUrl.startsWith("http") ? mood.imageUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${mood.imageUrl}`}
                                    alt={mood.name}
                                    className="w-24 h-24 object-cover rounded-lg mr-4"
                                />
                                <div>
                                    <h3 className="text-lg font-bold text-white">{mood.name}</h3>
                                    <p className="text-gray-400 text-sm">{t('moods.presetConfig.game')}: {game.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 mb-6">
                                {game.name.toUpperCase().includes('MINECRAFT') && (
                                    <>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept=".jar"
                                            className="hidden"
                                        />
                                        <Button
                                            onClick={handleOpenFilePicker}
                                            className="bg-[#2A2D36] text-white hover:bg-[#3A3D46] flex items-center space-x-2"
                                            disabled={isServerLoading || isServerRunning}
                                        >
                                            <FolderOpen size={16} />
                                            <span>{t('moods.presetConfig.selectServerJar')}</span>
                                        </Button>
                                        {serverPath && (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-400 text-sm max-w-xs truncate" title={serverPath}>
                                                    {serverPath.split('\\').pop()}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setServerPath("")}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        )}
                                        <Button
                                            onClick={isServerRunning ? handleStopServer : handleStartServer}
                                            className={`w-10 h-10 p-0 rounded-full ${isServerRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}`}
                                            disabled={!serverPath || isServerLoading}
                                        >
                                            {isServerLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : isServerRunning ? (
                                                <StopCircle size={20} />
                                            ) : (
                                                <Play size={20} />
                                            )}
                                        </Button>
                                    </>
                                )}
                                <Input
                                    type="text"
                                    placeholder="@username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-[#2A2D36] text-white border-none w-48"
                                    disabled={isConnecting || !profile?.role?.includes('admin')}
                                />
                                <div className="flex items-center space-x-1">
                                    <div className="relative group">
                                        <Button
                                            onClick={handleToggleMonitoring}
                                            className={`w-10 h-10 p-0 rounded-full ${isMonitoring ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-green-600"}`}
                                            disabled={!username || isConnecting || disableActions}
                                        >
                                            {isConnecting ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : isMonitoring ? (
                                                <StopCircle size={20} />
                                            ) : (
                                                <Play size={20} />
                                            )}
                                        </Button>
                                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-72 text-left pointer-events-none z-50">
                                            {isMonitoring ? t('moods.presetConfig.stopMonitoring') : t('moods.presetConfig.startMonitoring')}
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="w-6 h-6 text-gray-400 hover:text-gray-200"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="w-4 h-4"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M12 16v-4" />
                                                <path d="M12 8h.01" />
                                            </svg>
                                        </Button>
                                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-72 text-left pointer-events-none z-50">
                                            {t('moods.presetConfig.monitoringInfo')}
                                        </div>
                                    </div>
                                </div>
                                {/* Painel de status GTA/Mods */}
                                {game?.name?.toLowerCase().includes('gta') && (
                                    <GtaStatusCard
                                        gtaStatus={gtaStatus}
                                        gtaLoading={gtaLoading}
                                        onInstallAll={() => handleInstall('chaosmod')}
                                        onSelectFolder={handleSelectGtaFolder}
                                        onUninstallAll={handleUninstallAll}
                                    />
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {presets.length > 0 ? (
                    <div className="mb-6">
                        <h3 className="text-white text-lg font-semibold mb-2">
                            {t('moods.presetConfig.actionsCreated')} ({presets.length}/{maxPresets})
                        </h3>
                        <div className="overflow-x-auto">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <table className="min-w-full bg-[#222429] text-white rounded-lg">
                                    <thead>
                                        <tr className="bg-[#2A2D36] text-gray-400">
                                            <th className="px-4 py-2 text-left">{t('moods.presetConfig.enable')}</th>
                                            <th className="px-4 py-2 text-left">
                                                {game?.name?.toLowerCase().includes('gta') 
                                                    ? t('moods.presetConfig.action') 
                                                    : t('moods.presetConfig.action')
                                                }
                                            </th>
                                            <th className="px-4 py-2 text-left">{t('moods.presetConfig.trigger')}</th>
                                            <th className="px-4 py-2 text-left">{t('moods.presetConfig.audio')}</th>
                                            <th className="px-4 py-2 text-left">{t('moods.presetConfig.shortcut')}</th>
                                            <th className="px-4 py-2 text-left">{t('moods.presetConfig.delay')}</th>
                                            <th className="px-4 py-2 text-left">{t('moods.presetConfig.overlayUrl')}</th>
                                            <th className="px-4 py-2 text-left">{t('moods.presetConfig.test')}</th>
                                            <th className="px-4 py-2 text-left">{t('moods.presetConfig.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <SortableContext
                                            items={presets.map(preset => preset.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {presets.map((preset) => (
                                                <SortableRow
                                                    key={preset.id}
                                                    preset={preset}
                                                    game={game}
                                                    isSoundPlaying={isSoundPlaying}
                                                    countdown={countdown}
                                                    disableActions={disableActions}
                                                    handleEdit={handleEdit}
                                                    handleCopyPreset={handleCopyPreset}
                                                    handleConfirmDelete={handleConfirmDelete}
                                                    handleTestPreset={handleTestPreset}
                                                    handleEnableChange={handleEnableChange}
                                                    t={t}
                                                />
                                            ))}
                                        </SortableContext>
                                    </tbody>
                                </table>
                            </DndContext>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 mb-6">{t('moods.presetConfig.noPresets')}</p>
                )}

                {disableActions && (
                    <div className="bg-yellow-700 text-yellow-200 p-4 rounded mb-4 text-center">
                        Você excedeu o limite do plano Free. Exclua modos ou vídeos até ficar dentro do limite para voltar a usar todos os recursos.
                    </div>
                )}

                <Button
                    className="mb-6 bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium"
                    onClick={() => setShowModal(true)}
                    disabled={disableActions}
                >
                    {t('moods.presetConfig.addAction')}
                </Button>

                {showModal && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center">
                        <div className="bg-[#222429] p-6 rounded-lg w-1/3 max-h-[90vh] flex flex-col">
                            <h3 className="text-white text-lg font-semibold mb-4">
                                {presetId ? t('moods.presetConfig.editPreset') : t('moods.presetConfig.addNewPreset')}
                            </h3>

                            <div className="overflow-y-auto flex-1 pr-2">
                                <form onSubmit={handleOpenConfirmDialog} className="space-y-4">
                                    <>
                                        {/* Campo Action - oculto para GTAV, visível para outros jogos */}
                                        {!game?.name?.toLowerCase().includes('gta') && (
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-300">{t('moods.presetConfig.action')}</label>
                                                <ClearableInput
                                                    name="action"
                                                    value={presetData.action}
                                                    onChange={handleInputChange}
                                                    onClear={() => handleClearField("action")}
                                                    placeholder={t('moods.presetConfig.action')}
                                                    className="bg-[#2A2D36] text-white border-none"
                                                />
                                            </div>
                                        )}

                                        {/* Campo Nome do Preset - aparece apenas para GTAV */}
                                        {game?.name?.toLowerCase().includes('gta') && (
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-300">{t('moods.presetConfig.action')}</label>
                                                <ClearableInput
                                                    name="name"
                                                    value={presetData.name}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value.length <= 20) {
                                                            handleInputChange(e);
                                                        }
                                                    }}
                                                    onClear={() => handleClearField("name")}
                                                    placeholder={t('moods.presetConfig.name')}
                                                    className="bg-[#2A2D36] text-white border-none"
                                                    maxLength={20}
                                                />
                                                <p className="text-xs text-gray-400">
                                                    Máximo 20 caracteres ({presetData.name.length}/20)
                                                </p>
                                            </div>
                                        )}


                                        <div className="space-y-">
                                            <label className="text-sm text-gray-300">{t('moods.presetConfig.delay')}</label>
                                            <div className="flex items-center space-x-2">
                                                <Input
                                                    type="number"
                                                    name="delay"
                                                    value={presetData.delay}
                                                    onChange={handleInputChange}
                                                    placeholder="0"
                                                    min="0"
                                                    step="1"
                                                    className="bg-[#2A2D36] text-white border-none w-20"
                                                />
                                                <span className="text-gray-400">segundos</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {t('moods.presetConfig.delayDescription')}
                                            </p>
                                            <p className="text-xs text-yellow-400 mt-1">
                                                {t('moods.presetConfig.delayInfo')}
                                            </p>
                                        </div>

                                        {game?.name.toLowerCase() !== 'batalha' && (

                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-300">{t('moods.presetConfig.gameCommand')}</label>

                                                {presetData.commandName ? (
                                                    <div className="flex items-center space-x-2 p-2 bg-[#2A2D36] rounded-md">
                                                        {presetData.commandImageUrl ? (
                                                            <img
                                                                src={`http://localhost:4000${presetData.commandImageUrl}`}
                                                                alt={presetData.commandName}
                                                                className="w-8 h-8 object-contain"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                                }}
                                                            />
                                                        ) : (
                                                            <Gamepad2 size={18} className="text-blue-400" />
                                                        )}
                                                        <div className="flex-1">
                                                            <span className="text-white">{presetData.commandName}</span>
                                                            <p className="text-gray-400 text-xs truncate">{presetData.commandDescription}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-2 bg-[#2A2D36] rounded-md text-gray-400 flex items-center">
                                                        <Gamepad2 className="mr-2" size={16} />
                                                        <span>{t('moods.presetConfig.noCommandSelected')}</span>
                                                    </div>
                                                )}

                                                <Button
                                                    type="button"
                                                    onClick={() => setShowGameCommandSelector(true)}
                                                    className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white"
                                                >
                                                    <Gamepad2 className="mr-1" size={18} />
                                                    {t('moods.presetConfig.chooseCommand')}
                                                </Button>
                                            </div>
                                        )}

                                    </>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300">{t('moods.presetConfig.triggerType')}</label>

                                        {selectedTrigger ? (
                                            <div className="flex items-center justify-between space-x-2 p-2 bg-[#2A2D36] rounded-md">
                                                <div className="flex items-center space-x-2">
                                                    {selectedTrigger.name === 'likes' ? (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-red-500">
                                                                <Heart size={16} className="text-white" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ) : selectedTrigger.name === 'subscribe' ? (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-purple-500">
                                                                <UserPlus size={16} className="text-white" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ) : selectedTrigger.name === 'share' ? (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-blue-500">
                                                                <Share2 size={16} className="text-white" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ) : selectedTrigger.name === 'chat' ? (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-green-500">
                                                                <MessageSquare size={16} className="text-white" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ) : selectedTrigger.name === 'follow' ? (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-orange-500">
                                                                <UserPlus size={16} className="text-white" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ) : selectedTrigger.name === 'gift' ? (
                                                        <>
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarFallback className="bg-yellow-500">
                                                                    <Gift size={16} className="text-white" />
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="capitalize">
                                                                Gift{presetData.giftName ? ` - ${presetData.giftName}` : ''}
                                                            </span>
                                                            {presetData.giftImageUrl && (
                                                                <img
                                                                    src={presetData.giftImageUrl}
                                                                    alt={presetData.giftName || 'Gift'}
                                                                    className="w-8 h-8 object-contain rounded"
                                                                    style={{ marginLeft: 8 }}
                                                                />
                                                            )}
                                                        </>
                                                    ) : selectedTrigger.filePath ? (
                                                        <img
                                                            src={`http://localhost:4000/${selectedTrigger.filePath}`}
                                                            alt={selectedTrigger.name}
                                                            className="w-8 h-8 object-contain"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                            }}
                                                        />
                                                    ) : (
                                                        <Avatar className="w-6 h-6 mr-2">
                                                            <AvatarFallback className="bg-yellow-500">
                                                                <Gift size={14} className="text-white" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    {selectedTrigger.name !== 'gift' && (
                                                        <span className="capitalize">
                                                            {selectedTrigger.name}
                                                            {selectedTrigger.name === 'gift' && presetData.giftName && ` - ${presetData.giftName}`}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleClearTrigger}
                                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`p-2 bg-[#2A2D36] rounded-md flex items-center ${giftError ? "border border-red-500" : ""}`}>
                                                <Gift className={`mr-2 ${giftError ? "text-red-500" : "text-gray-400"}`} size={16} />
                                                <span className={`${giftError ? "text-red-500" : "text-gray-400"}`}>
                                                    {t('moods.presetConfig.noTriggerSelected')}
                                                </span>
                                            </div>
                                        )}

                                        {giftError && <p className="text-red-500 text-sm">{t('moods.presetConfig.requiredField')}</p>}

                                        <Button
                                            type="button"
                                            onClick={() => setShowTriggerSelector(true)}
                                            className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white"
                                        >
                                            <Gift className="mr-1" size={18} />
                                            {t('moods.presetConfig.chooseTrigger')}
                                        </Button>
                                    </div>

                                    {selectedTrigger?.name === 'chat' && (
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-300">{t('moods.presetConfig.chatWord')} <span className="text-red-500">*</span></label>
                                            <ClearableInput
                                                name="chatWord"
                                                value={presetData.chatWord}
                                                onChange={handleInputChange}
                                                onClear={() => handleClearField("chatWord")}
                                                placeholder={t('moods.presetConfig.chatWordPlaceholder')}
                                                className="bg-[#2A2D36] text-white border-none"
                                                required
                                            />
                                        </div>
                                    )}

                                    {selectedTrigger?.name === 'likes' && (
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-300">{t('moods.presetConfig.likesCount')} <span className="text-red-500">*</span></label>
                                            <ClearableInput
                                                type="number"
                                                name="likesCount"
                                                value={presetData.likesCount}
                                                onChange={handleInputChange}
                                                onClear={() => handleClearField("likesCount")}
                                                placeholder={t('moods.presetConfig.likesCountPlaceholder')}
                                                className="bg-[#2A2D36] text-white border-none"
                                                required
                                                min="1"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300">{t('moods.presetConfig.selectedSound')}</label>

                                        {presetData.soundTitle ? (
                                            <div className="flex items-center justify-between space-x-2 p-2 bg-[#2A2D36] rounded-md">
                                                <div className="flex items-center space-x-2">
                                                    <Music size={18} className="text-blue-400" />
                                                    <span className="text-white truncate">{presetData.soundTitle}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleClearSound}
                                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-[#2A2D36] rounded-md text-gray-400 flex items-center">
                                                <Music className="mr-2" size={16} />
                                                <span>{t('moods.presetConfig.noSoundSelected')}</span>
                                            </div>
                                        )}

                                        <Button
                                            type="button"
                                            onClick={() => setShowSoundSelector(true)}
                                            className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white"
                                        >
                                            <Music className="mr-1" size={18} />
                                            {t('moods.presetConfig.chooseSound')}
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300">{t('moods.presetConfig.overlayVideoUrl')}</label>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Button
                                                type="button"
                                                onClick={() => setVideoInputType('url')}
                                                className={`flex-1 ${videoInputType === 'url' ? 'bg-[#FFD110] text-black' : 'bg-[#3A3D46] text-white'}`}
                                            >
                                                URL Youtube
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => setVideoInputType('upload')}
                                                className={`flex-1 ${videoInputType === 'upload' ? 'bg-[#FFD110] text-black' : 'bg-[#3A3D46] text-white'}`}
                                            >
                                                Upload
                                            </Button>
                                        </div>

                                        {videoInputType === 'url' ? (
                                            <ClearableInput
                                                name="videoUrl"
                                                value={presetData.videoUrl}
                                                onChange={handleInputChange}
                                                onClear={() => handleClearField("videoUrl")}
                                                placeholder={t('moods.presetConfig.overlayVideoPlaceholder')}
                                                className="bg-[#2A2D36] text-white border-none"
                                            />
                                        ) : (
                                            <div className="space-y-2">
                                                <input
                                                    type="file"
                                                    ref={videoFileInputRef}
                                                    onChange={handleVideoFileSelect}
                                                    accept="video/*"
                                                    className="hidden"
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        type="button"
                                                        onClick={handleOpenVideoFilePicker}
                                                        className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white"
                                                    >
                                                        <FolderOpen className="mr-2" size={16} />
                                                        {videoFile ? t('moods.presetConfig.videoSelected') : t('moods.presetConfig.selectVideo')}
                                                    </Button>
                                                    {videoFile && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                setVideoFile(null);
                                                                handleClearField("videoUrl");
                                                            }}
                                                            className="bg-red-500 hover:bg-red-600 text-white"
                                                        >
                                                            <X size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                                {videoFile && (
                                                    <p className="text-sm text-gray-400 truncate">
                                                        {videoFile.name === 'video.mp4' ?
                                                            "Vídeo enviado" :
                                                            `${t('moods.presetConfig.videoSelected')}: ${videoFile.name}`
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300">{t('moods.presetConfig.shortcutKey')}</label>
                                        <Input
                                            name="keybind"
                                            value={presetData.keybind}
                                            onChange={() => { }}
                                            placeholder={t('moods.presetConfig.shortcutKeyPlaceholder')}
                                            onKeyDown={(e) => {
                                                e.preventDefault();

                                                // Excluir teclas espaço e backspace
                                                if (e.code === 'Space' || e.code === 'Backspace') {
                                                    setPresetData((prevData) => ({
                                                        ...prevData,
                                                        keybind: "",
                                                    }));
                                                    return;
                                                }

                                                let combo = [];
                                                if (e.ctrlKey) combo.push('Ctrl');
                                                if (e.altKey) combo.push('Alt');
                                                if (e.shiftKey) combo.push('Shift');
                                                if (e.metaKey) combo.push('Meta');
                                                let mainKey = '';
                                                if (e.code.startsWith('Key')) {
                                                    mainKey = e.code.replace('Key', '').toUpperCase();
                                                } else if (e.code.startsWith('Digit')) {
                                                    mainKey = e.code.replace('Digit', '');
                                                } else if (e.code.startsWith('Numpad')) {
                                                    const num = e.code.replace('Numpad', '');
                                                    mainKey = /^\d+$/.test(num) ? `Num${num}` : `Num${num}`;
                                                } else {
                                                    mainKey = e.code;
                                                }
                                                combo.push(mainKey);
                                                setPresetData((prevData) => ({
                                                    ...prevData,
                                                    keybind: combo.join('+'),
                                                }));
                                            }}
                                            className="bg-[#2A2D36] text-white border-none"
                                        />
                                        <p className="text-xs text-gray-400 mt-1" dangerouslySetInnerHTML={{ __html: t('moods.presetConfig.keyboardShortcutTip') }} />
                                    </div>
                                    <div className="flex justify-end space-x-4">
                                        <Button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="bg-red-500 text-white"
                                        >
                                            {t('moods.presetConfig.close')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium"
                                            disabled={loading || isUploading}
                                        >
                                            {loading ? t('moods.presetConfig.sending') : isUploading ? t('moods.presetConfig.sendingVideo') : presetId ? t('moods.presetConfig.save') : t('moods.presetConfig.add')}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                <AlertDialog open={showConfirmDialog} onOpenChange={(open) => {
                    setShowConfirmDialog(open);
                    if (!open) {
                        handleClearForm();
                    }
                }}>
                    <AlertDialogContent className="bg-[#222429] text-white border-none">
                        <AlertDialogHeader>
                            <AlertDialogTitle>{presetId ? t('moods.presetConfig.confirmEdit') : t('moods.presetConfig.confirmAdd')}</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                {presetId
                                    ? t('moods.presetConfig.confirmEditMessage', { name: presetData.name })
                                    : t('moods.presetConfig.confirmAddMessage', { name: presetData.name })
                                }
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="bg-gray-600 text-white hover:bg-gray-700 hover:text-white"
                                onClick={() => setShowConfirmDialog(false)}
                            >
                                {t('moods.presetConfig.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium"
                                onClick={handleSubmit}
                            >
                                {presetId ? t('moods.presetConfig.confirmEdit') : t('moods.presetConfig.confirmAdd')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <AlertDialogContent className="bg-[#222429] text-white border-none">
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('moods.presetConfig.confirmDelete')}</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                {t('moods.presetConfig.confirmDeleteMessage')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="bg-gray-600 text-white hover:bg-gray-700 hover:text-white"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                {t('moods.presetConfig.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={handleDelete}
                            >
                                {t('moods.presetConfig.confirmDeleteAction')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                    <AlertDialogContent className="bg-[#222429] text-white border-none">
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('moods.presetConfig.limitReached')}</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                {limitDialogMessage}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="bg-gray-600 text-white hover:bg-gray-700 hover:text-white"
                                onClick={() => setShowLimitDialog(false)}
                            >
                                {t('moods.presetConfig.close')}
                            </AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <GiftSelector
                    open={showGiftSelector}
                    onOpenChange={setShowGiftSelector}
                    onSelectGift={handleSelectGift}
                />

                <SoundSelector
                    open={showSoundSelector}
                    onOpenChange={setShowSoundSelector}
                    onSelectSound={handleSelectSound}
                />

                <GameCommandSelector
                    open={showGameCommandSelector}
                    onOpenChange={setShowGameCommandSelector}
                    onSelectCommand={handleSelectCommand}
                    gameName={game?.name}
                />

                {countdown !== null && countdownPreset && (
                    <CountdownOverlay
                        seconds={countdown}
                        presetName={countdownPreset.name}
                        onCancel={handleCancelCountdown}
                    />
                )}
            </div>
            {showMonitor && (
                <TikTokMonitor
                    username={username}
                    isMonitoring={isMonitoring}
                    onClose={stopMonitoring}
                />
            )}

            {showTriggerSelector && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center">
                    <div className="bg-[#222429] p-6 rounded-lg w-1/3">
                        <h3 className="text-white text-lg font-semibold mb-4">{t('moods.presetConfig.triggerType')}</h3>
                        <div className="space-y-2">
                            {triggers.map((trigger) => (
                                <Button
                                    key={trigger.id}
                                    type="button"
                                    onClick={() => handleSelectTrigger(trigger)}
                                    className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white flex items-center justify-start"
                                >
                                    {trigger.name === 'likes' ? (
                                        <Avatar className="w-6 h-6 mr-2">
                                            <AvatarFallback className="bg-red-500">
                                                <Heart size={14} className="text-white" />
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : trigger.name === 'subscribe' ? (
                                        <Avatar className="w-6 h-6 mr-2">
                                            <AvatarFallback className="bg-purple-500">
                                                <UserPlus size={14} className="text-white" />
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : trigger.name === 'share' ? (
                                        <Avatar className="w-6 h-6 mr-2">
                                            <AvatarFallback className="bg-blue-500">
                                                <Share2 size={14} className="text-white" />
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : trigger.name === 'chat' ? (
                                        <Avatar className="w-6 h-6 mr-2">
                                            <AvatarFallback className="bg-green-500">
                                                <MessageSquare size={14} className="text-white" />
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : trigger.name === 'follow' ? (
                                        <Avatar className="w-6 h-6 mr-2">
                                            <AvatarFallback className="bg-orange-500">
                                                <UserPlus size={14} className="text-white" />
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : trigger.filePath ? (
                                        <img
                                            src={`http://localhost:4000/${trigger.filePath}`}
                                            alt={trigger.name}
                                            className="w-6 h-6 object-contain mr-2"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                                            }}
                                        />
                                    ) : (
                                        <Avatar className="w-6 h-6 mr-2">
                                            <AvatarFallback className="bg-yellow-500">
                                                <Gift size={14} className="text-white" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <span className="capitalize">{trigger.name}</span>
                                </Button>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button
                                type="button"
                                onClick={() => setShowTriggerSelector(false)}
                                className="bg-red-500 text-white"
                            >
                                {t('moods.presetConfig.close')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Preview do Overlay */}
            {showOverlayPreview && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-[#222429] p-6 rounded-lg w-1/2 h-2/3 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white text-lg font-semibold">
                                {t('moods.presetConfig.overlayPreview')}
                            </h3>
                            <Button
                                onClick={() => setShowOverlayPreview(false)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                            >
                                <X size={16} />
                            </Button>
                        </div>
                        <div className="flex-1 bg-black/5 rounded-lg overflow-hidden">
                            <iframe
                                src={`http://localhost:4000/presets/overlay/${gameId}/${moodId}?userId=${profile?.id}&preview=true`}
                                className="w-full h-full"
                                title="Overlay Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MoodPresetConfig;
