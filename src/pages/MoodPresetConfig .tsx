import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Switch } from "@/components/ui/switch";
import { useProfile } from "@/hooks/use-profile";
import { useTikTokMonitor } from "@/contexts/TikTokMonitorContext";
import TikTokMonitor from "@/components/TikTokMonitor";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/utils/api";
import { Gift, Music, Gamepad2, Play, StopCircle, Loader2, Heart, Share2, MessageSquare, UserPlus, FolderOpen, X, Copy } from "lucide-react";
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
}

interface Trigger {
    id: number;
    name: string;
    imageUrl: string | null;
    filePath: string;
}

const MoodPresetConfig = () => {
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
    const [username, setUsername] = useState("");
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
    const [videoInputType, setVideoInputType] = useState<'url' | 'upload'>('url');
    const videoFileInputRef = useRef<HTMLInputElement>(null);

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
            videoUrl: preset.videoUrl || "",
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
        
        // Verifica se o usuário tem plano free e já atingiu o limite de 6 presets
        // Apenas verifica o limite se for uma adição de novo preset (não edição)
        if (!presetId && profile?.plan === 'free' && presets.length >= 5) {
            setShowLimitDialog(true);
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
        if (!selectedTrigger) {
            setGiftError(true);
            setLoading(false);
            return;
        }
        setGiftError(false);

        try {
            let response;
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
                trigger: selectedTrigger.name,
                triggerImageUrl: selectedTrigger.name === 'gift' ? presetData.giftImageUrl : selectedTrigger.filePath,
                chatWord: presetData.chatWord,
                likesCount: presetData.likesCount,
                videoUrl: presetData.videoUrl,
            };

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
            keybind: giftInfo.id,
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
            } else {
                // Stop monitoring
                await apiRequest(`/tiktok/monitor?username=${username}`, {
                    method: "DELETE",
                    isAuthenticated: true,
                });
                stopMonitoring();
            }
        } catch (error) {
            console.error("Erro ao alternar monitoramento:", error);
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
                // Se o som já está tocando, para ele
                await apiRequest('/sounds/stop', {
                    method: 'POST',
                    isAuthenticated: true,
                });
                setIsSoundPlaying(null);
                toast({
                    title: "Sucesso",
                    description: "Som parado com sucesso!",
                    duration: 6000,
                });
            } else {
                // Se o som não está tocando, toca ele
                setIsSoundPlaying(preset.id);
                try {
                    await apiRequest(`/tester/preset/${preset.id}/test`, {
                        method: "POST",
                        isAuthenticated: true,
                    });
                    toast({
                        title: "Sucesso",
                        description: "Preset testado com sucesso!",
                        duration: 6000,
                    });
                } catch (error) {
                    setIsSoundPlaying(null);
                    throw error;
                }
                // Resetar o estado após o teste (sucesso)
                setIsSoundPlaying(null);
            }
        } catch (error) {
            setIsSoundPlaying(null);
            console.error("Erro ao testar preset:", error);
            toast({
                title: "Erro",
                description: "Não foi possível testar o preset. Verifique se o servidor está rodando.",
                variant: "destructive",
                duration: 6000,
            });
        }
    };

    const handleVideoFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await apiRequest('/presets/upload-video', {
                    method: 'POST',
                    body: formData,
                    isAuthenticated: true,
                    headers: {
                        // Não incluir Content-Type aqui, o navegador vai definir automaticamente com o boundary correto
                    },
                });

                if (response && response.videoUrl) {
                    setPresetData(prev => ({
                        ...prev,
                        videoUrl: response.videoUrl
                    }));
                    toast({
                        title: "Sucesso",
                        description: "Vídeo enviado com sucesso!",
                        duration: 6000,
                    });
                }
            } catch (error) {
                console.error("Erro ao fazer upload do vídeo:", error);
                toast({
                    title: "Erro",
                    description: "Não foi possível fazer o upload do vídeo. Tente novamente.",
                    variant: "destructive",
                    duration: 6000,
                });
            }
        }
    };

    const handleOpenVideoFilePicker = () => {
        videoFileInputRef.current?.click();
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#1A1C24] p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white text-2xl font-bold">Configurar Preset do Mood</h2>
                    <Button
                        onClick={() => navigate(`/moods/${gameId}/mood/${moodId}/overlay`)}
                        className="bg-[#FFD110] hover:bg-[#E6C00F] text-black"
                    >
                        Gerar Link do Overlay
                    </Button>
                </div>

                {game && mood && (
                    <Card className="bg-[#222429] border-none mb-6">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center">
                                <img
                                    src={`http://localhost:4000${mood.imageUrl}`}
                                    alt={mood.name}
                                    className="w-24 h-24 object-cover rounded-lg mr-4"
                                />
                                <div>
                                    <h3 className="text-lg font-bold text-white">{mood.name}</h3>
                                    <p className="text-gray-400 text-sm">Jogo: {game.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {game.name.toUpperCase().includes('MINECRAFT') && (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            accept=".jar"
                                            className="hidden"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                onClick={handleOpenFilePicker}
                                                className="bg-[#2A2D36] text-white hover:bg-[#3A3D46] flex items-center space-x-2"
                                                disabled={isServerLoading || isServerRunning}
                                            >
                                                <FolderOpen size={16} />
                                                <span>Selecionar server.jar</span>
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
                                        </div>
                                        <Button
                                            onClick={isServerRunning ? handleStopServer : handleStartServer}
                                            className={`w-10 h-10 p-0 rounded-full ${
                                                isServerRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                                            }`}
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
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="text"
                                        placeholder="@username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="bg-[#2A2D36] text-white border-none w-48"
                                        disabled={isConnecting}
                                    />
                                    <Button
                                        onClick={handleToggleMonitoring}
                                        className={`w-10 h-10 p-0 rounded-full ${
                                            isMonitoring ? "bg-red-500 hover:bg-red-600" : "bg-yellow-500 hover:bg-green-600"
                                        }`}
                                        disabled={!username || isConnecting}
                                    >
                                        {isConnecting ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : isMonitoring ? (
                                            <StopCircle size={20} />
                                        ) : (
                                            <Play size={20} />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {presets.length > 0 ? (
                    <div className="mb-6">
                        <h3 className="text-white text-lg font-semibold mb-2">
                            Presets Criados ({presets.length}/5)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-[#222429] text-white rounded-lg">
                                <thead>
                                    <tr className="bg-[#2A2D36] text-gray-400">
                                        <th className="px-4 py-2 text-left">Habilitar</th>
                                        <th className="px-4 py-2 text-left">Nome</th>
                                        <th className="px-4 py-2 text-left">Ação</th>
                                        <th className="px-4 py-2 text-left">Disparador</th>
                                        <th className="px-4 py-2 text-left">Audio</th>
                                        <th className="px-4 py-2 text-left">Testar</th>
                                        <th className="px-4 py-2 text-left">URL do Overlay</th>
                                        <th className="px-4 py-2 text-left">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {presets.map((preset) => (
                                        <tr key={preset.id} className="border-b border-[#2A2D36]">
                                            <td className="px-4 py-2">
                                                <Switch
                                                    checked={preset.active}
                                                    onCheckedChange={(value) => handleEnableChange(preset.id, value)}
                                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-500"
                                                />
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">{preset.name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap">{preset.action}</td>
                                            <td className="px-4 py-2">
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
                                                            <AvatarFallback className="bg-pink-500">
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
                                            <td className="px-4 py-2">
                                                <Button
                                                    onClick={() => handleTestPreset(preset)}
                                                    className={`w-10 h-10 p-0 rounded-full ${
                                                        isSoundPlaying === preset.id ? "bg-red-500 hover:bg-red-600" : "bg-yellow-400 hover:bg-yellow-500"
                                                    } text-black`}
                                                    disabled={!preset.active}
                                                >
                                                    {isSoundPlaying === preset.id ? (
                                                        <StopCircle size={20} />
                                                    ) : (
                                                        <Play size={20} />
                                                    )}
                                                </Button>
                                            </td>
                                            <td className="px-4 py-2">
                                                {preset.videoUrl && (
                                                    <Button
                                                        onClick={() => {
                                                            const overlayUrl = `http://localhost:4000/presets/overlay/${preset.id}`;
                                                            navigator.clipboard.writeText(overlayUrl);
                                                            toast({
                                                                title: "URL copiada!",
                                                                description: "A URL do overlay foi copiada para a área de transferência.",
                                                                duration: 3000,
                                                            });
                                                        }}
                                                        className="bg-[#3A3D46] hover:bg-[#4A4D56] text-white"
                                                    >
                                                        <Copy size={16} className="mr-1" />
                                                        Copiar URL do Overlay
                                                    </Button>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 flex flex-wrap gap-2">
                                                <Button
                                                    onClick={() => handleEdit(preset)}
                                                    className="bg-blue-500 text-white w-24"
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    onClick={() => handleConfirmDelete(preset.id)}
                                                    className="bg-red-500 text-white w-24"
                                                >
                                                    Deletar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 mb-6">Nenhum preset encontrado para este mood.</p>
                )}

                <Button
                    className="mb-6 bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium"
                    onClick={() => setShowModal(true)}
                >
                    Adicionar Preset
                </Button>

                {showModal && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex justify-center items-center">
                        <div className="bg-[#222429] p-6 rounded-lg w-1/3 max-h-[90vh] flex flex-col">
                            <h3 className="text-white text-lg font-semibold mb-4">
                                {presetId ? "Editar Preset" : "Adicionar Novo Preset"}
                            </h3>

                            <div className="overflow-y-auto flex-1 pr-2">
                                <form onSubmit={handleOpenConfirmDialog} className="space-y-4">
                                    <ClearableInput
                                        name="name"
                                        value={presetData.name}
                                        onChange={handleInputChange}
                                        onClear={() => handleClearField("name")}
                                        placeholder="Nome do Preset"
                                        className="bg-[#2A2D36] text-white border-none"
                                        required
                                    />

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300">Ação</label>
                                        <ClearableInput
                                            name="action"
                                            value={presetData.action}
                                            onChange={handleInputChange}
                                            onClear={() => handleClearField("action")}
                                            placeholder="Ação"
                                            className="bg-[#2A2D36] text-white border-none"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300">Comando do Jogo</label>

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
                                                <span>Nenhum comando selecionado</span>
                                            </div>
                                        )}

                                        <Button
                                            type="button"
                                            onClick={() => setShowGameCommandSelector(true)}
                                            className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white"
                                        >
                                            <Gamepad2 className="mr-1" size={18} />
                                            Escolher Comando
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300">Tipo de Disparador <span className="text-red-500">*</span></label>

                                        {selectedTrigger ? (
                                            <div className="flex items-center justify-between space-x-2 p-2 bg-[#2A2D36] rounded-md">
                                                <div className="flex items-center space-x-2">
                                                    {selectedTrigger.name === 'likes' ? (
                                                        <Avatar className="w-8 h-8">
                                                            <AvatarFallback className="bg-pink-500">
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
                                                        <Gift size={18} className="text-blue-400" />
                                                    )}
                                                    <span className="text-white capitalize">
                                                        {selectedTrigger.name}
                                                        {selectedTrigger.name === 'gift' && presetData.giftName && ` - ${presetData.giftName}`}
                                                    </span>
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
                                                    Nenhum disparador selecionado
                                                </span>
                                            </div>
                                        )}

                                        {giftError && <p className="text-red-500 text-sm">Selecione um disparador antes de continuar.</p>}

                                        <Button
                                            type="button"
                                            onClick={() => setShowTriggerSelector(true)}
                                            className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white"
                                        >
                                            <Gift className="mr-1" size={18} />
                                            Escolher Disparador
                                        </Button>
                                    </div>

                                    {/* Campos condicionais com base no tipo de disparador */}
                                    {selectedTrigger?.name === 'chat' && (
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-300">Palavra no Chat <span className="text-red-500">*</span></label>
                                            <ClearableInput
                                                name="chatWord"
                                                value={presetData.chatWord}
                                                onChange={handleInputChange}
                                                onClear={() => handleClearField("chatWord")}
                                                placeholder="Digite a palavra que deve aparecer no chat"
                                                className="bg-[#2A2D36] text-white border-none"
                                                required
                                            />
                                        </div>
                                    )}

                                    {selectedTrigger?.name === 'likes' && (
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-300">Quantidade de Likes <span className="text-red-500">*</span></label>
                                            <ClearableInput
                                                type="number"
                                                name="likesCount"
                                                value={presetData.likesCount}
                                                onChange={handleInputChange}
                                                onClear={() => handleClearField("likesCount")}
                                                placeholder="Digite a quantidade de likes necessária"
                                                className="bg-[#2A2D36] text-white border-none"
                                                required
                                                min="1"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300">Som Selecionado</label>

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
                                                <span>Nenhum som selecionado</span>
                                            </div>
                                        )}

                                        <Button
                                            type="button"
                                            onClick={() => setShowSoundSelector(true)}
                                            className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white"
                                        >
                                            <Music className="mr-1" size={18} />
                                            Escolher Som
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-300">URL do Vídeo de Overlay</label>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Button
                                                type="button"
                                                onClick={() => setVideoInputType('url')}
                                                className={`flex-1 ${videoInputType === 'url' ? 'bg-[#FFD110] text-black' : 'bg-[#3A3D46] text-white'}`}
                                            >
                                                URL
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
                                                placeholder="URL do vídeo para exibir no overlay"
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
                                                        Selecionar Vídeo
                                                    </Button>
                                                    {presetData.videoUrl && (
                                                        <Button
                                                            type="button"
                                                            onClick={() => handleClearField("videoUrl")}
                                                            className="bg-red-500 hover:bg-red-600 text-white"
                                                        >
                                                            <X size={16} />
                                                        </Button>
                                                    )}
                                                </div>
                                                {presetData.videoUrl && (
                                                    <p className="text-sm text-gray-400 truncate">
                                                        Vídeo selecionado: {presetData.videoUrl.split('/').pop()}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <ClearableInput
                                        type="number"
                                        name="delay"
                                        value={presetData.delay}
                                        onChange={handleInputChange}
                                        onClear={() => handleClearField("delay")}
                                        placeholder="Delay (em segundos)"
                                        className="bg-[#2A2D36] text-white border-none"
                                        required
                                    />
                                    <div className="flex justify-end space-x-4">
                                        <Button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="bg-red-500 text-white"
                                        >
                                            Fechar
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium"
                                            disabled={loading}
                                        >
                                            {loading ? "Enviando..." : presetId ? "Salvar" : "Adicionar"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

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

                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <AlertDialogContent className="bg-[#222429] text-white border-none">
                        <AlertDialogHeader>
                            <AlertDialogTitle>{presetId ? "Confirmar Edição" : "Confirmar Adição"}</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                {presetId
                                    ? `Tem certeza que deseja salvar as alterações no preset "${presetData.name}"?`
                                    : `Tem certeza que deseja adicionar o preset "${presetData.name}"?`
                                }
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="bg-gray-600 text-white hover:bg-gray-700 hover:text-white"
                                onClick={() => setShowConfirmDialog(false)}
                            >
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium"
                                onClick={handleSubmit}
                            >
                                {presetId ? "Confirmar Edição" : "Confirmar Adição"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <AlertDialogContent className="bg-[#222429] text-white border-none">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                Tem certeza que deseja excluir este preset? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="bg-gray-600 text-white hover:bg-gray-700 hover:text-white"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600 text-white"
                                onClick={handleDelete}
                            >
                                Confirmar Exclusão
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
                    <AlertDialogContent className="bg-[#222429] text-white border-none">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Limite de Presets Atingido</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                O plano free permite apenas 5 presets. Atualize para o plano premium para criar mais presets ou exclua um preset existente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="bg-gray-600 text-white hover:bg-gray-700 hover:text-white"
                                onClick={() => setShowLimitDialog(false)}
                            >
                                Fechar
                            </AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
                        <h3 className="text-white text-lg font-semibold mb-4">Selecione o Tipo de Disparador</h3>
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
                                            <AvatarFallback className="bg-pink-500">
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
                                Fechar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MoodPresetConfig;
