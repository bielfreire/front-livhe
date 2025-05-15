import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout"; // Importando o layout
import { config } from "@/config";

interface Mood {
    id: number;
    name: string;
    imageUrl: string;
}

interface Game {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    moods: Mood[];
}

const Games = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGames = async () => {
            try {
                setLoading(true);
                const response = await apiRequest('/services', {
                    method: 'GET',
                    isAuthenticated: true
                });

                if (response && response.length > 0) {
                    // Filtra apenas os jogos com o nome "Batalha"
                    const filteredGames = response.filter((game: Game) => game.name.toLowerCase() === 'batalha');
                    setGames(filteredGames);
                }
            } catch (error) {
                console.error("Erro ao buscar jogos:", error);
                toast({
                    title: "Erro ao carregar jogos",
                    description: "Não foi possível obter a lista de jogos. Verifique sua conexão.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [toast]);

    // Função para obter URL completa da imagem
    const getFullImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        return `${config.apiUrl}${url}`;
    };

    return (
        <Layout>
            <h3 className="text-2xl font-bold text-white mb-6">Batalha de Lives</h3>
            {loading ? (
                <p className="text-gray-400">Carregando...</p>
            ) : games.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map(game => (
                        <Card key={game.id} className="bg-[#222429] border-none overflow-hidden">
                            <div className="h-40 overflow-hidden">
                                <img src={getFullImageUrl(game.imageUrl)} alt={game.name} className="w-full h-full object-cover" />
                            </div>
                            <CardContent className="p-4 flex flex-col items-center">
                                <h4 className="text-lg font-medium text-white mb-4">{game.name}</h4>
                                <Button
                                    className="w-full bg-transparent border border-[#FFD110] text-[#FFD110] hover:bg-[#FFD110] hover:text-black"
                                    onClick={() => navigate(`/battle/${game.id}`)}
                                >
                                    Acessar
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">Nenhum jogo encontrado.</p>
            )}
        </Layout>
    );
};

export default Games;
