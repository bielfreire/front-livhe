import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/utils/api";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GameCommand {
    name: string;
    command: string;
    description: string;
    imgUrl: string;
    value?: {
        required: boolean;
        name: string;
        url?: string;
        defaultValue: string | number;
        description: string;
    };
}

interface MinecraftCommand {
    name: string;
    description: string;
    example: string;
}

interface GameCommandSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectCommand: (commandInfo: { name: string; command: string; description: string; imgUrl: string }) => void;
    gameName?: string;
}

export const GameCommandSelector = ({ open, onOpenChange, onSelectCommand, gameName }: GameCommandSelectorProps) => {
    const [commands, setCommands] = useState<GameCommand[]>([]);
    const [minecraftCommands, setMinecraftCommands] = useState<Record<string, MinecraftCommand[]>>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCommands = async () => {
            setLoading(true);
            try {
                if (gameName?.toLowerCase().includes('minecraft')) {
                    const response = await apiRequest("/minecraft/commands", { method: "GET", isAuthenticated: true });
                    setMinecraftCommands(response);
                } else {
                    const response = await apiRequest("/game-commands", { method: "GET", isAuthenticated: true });
                    setCommands(response.commands || []);
                }
            } catch (error) {
                console.error("Erro ao buscar comandos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (open) {
            fetchCommands();
        }
    }, [open, gameName]);

    const filteredCommands = commands.filter((cmd) =>
        cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredMinecraftCommands = Object.entries(minecraftCommands).reduce((acc, [category, cmds]) => {
        const filtered = cmds.filter(cmd =>
            cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
            acc[category] = filtered;
        }
        return acc;
    }, {} as Record<string, MinecraftCommand[]>);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#222429] text-white border-none max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Selecione um Comando do Jogo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Buscar comandos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#2A2D36] text-white border-none"
                    />
                    {loading ? (
                        <div className="text-center text-gray-400">Carregando comandos...</div>
                    ) : gameName?.toLowerCase().includes('minecraft') ? (
                        <ScrollArea className="h-[400px]">
                            <div className="grid grid-cols-1 gap-4">
                                {Object.entries(filteredMinecraftCommands).map(([category, cmds]) => (
                                    <div key={category} className="space-y-2">
                                        <h3 className="text-white font-medium capitalize">{category}</h3>
                                        {cmds.map((cmd) => (
                                            <div
                                                key={cmd.name}
                                                className="flex items-center space-x-4 p-4 bg-[#2A2D36] rounded-lg cursor-pointer hover:bg-[#3A3D46]"
                                                onClick={() => {
                                                    onSelectCommand({
                                                        name: cmd.name,
                                                        command: cmd.example,
                                                        description: cmd.description,
                                                        imgUrl: ""
                                                    });
                                                    onOpenChange(false);
                                                }}
                                            >
                                                <div className="flex-1">
                                                    <h3 className="text-white font-medium">{cmd.name}</h3>
                                                    <p className="text-gray-400 text-sm">{cmd.description}</p>
                                                    <p className="text-gray-500 text-xs mt-1">Exemplo: {cmd.example}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <ScrollArea className="h-[400px]">
                            <div className="grid grid-cols-1 gap-4">
                                {filteredCommands.map((cmd) => (
                                    <div
                                        key={cmd.command}
                                        className="flex items-center space-x-4 p-4 bg-[#2A2D36] rounded-lg cursor-pointer hover:bg-[#3A3D46]"
                                        onClick={() => {
                                            onSelectCommand({
                                                name: cmd.name,
                                                command: cmd.command,
                                                description: cmd.description,
                                                imgUrl: cmd.imgUrl
                                            });
                                            onOpenChange(false);
                                        }}
                                    >
                                        <div className="w-16 h-16 flex-shrink-0">
                                            {cmd.imgUrl ? (
                                                <img
                                                    src={`http://localhost:4000${cmd.imgUrl}`}
                                                    alt={cmd.name}
                                                    className="w-full h-full object-cover rounded-md"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[#1A1C24] rounded-md flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Sem imagem</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-medium">{cmd.name}</h3>
                                            <p className="text-gray-400 text-sm">{cmd.description}</p>
                                            {cmd.value && (
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {cmd.value.required ? "Obrigatório" : "Opcional"}: {cmd.value.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}; 