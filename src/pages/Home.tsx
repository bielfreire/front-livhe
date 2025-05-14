import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
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

const Home = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();


  const topStreamers = [
    { id: 1, name: "Gabriel_freire", views: "25,000", avatar: "https://i.pravatar.cc/100?img=1" },
    { id: 2, name: "vilhena", views: "10,000", avatar: "https://i.pravatar.cc/100?img=2" },
    { id: 3, name: "jordao-L-13", views: "8,500", avatar: "https://i.pravatar.cc/100?img=3" },
  ];

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('/services', {
          method: 'GET',
          isAuthenticated: true
        });

        if (response && response.length > 0) {
          setGames(response);
          
          // Recupera o último jogo acessado do localStorage
          const lastAccessedGameId = localStorage.getItem('lastAccessedGameId');
          if (lastAccessedGameId) {
            const lastGame = response.find(game => game.id === Number(lastAccessedGameId));
            if (lastGame) {
              setActiveGame(lastGame);
            } else {
              setActiveGame(response[0]);
            }
          } else {
            setActiveGame(response[0]);
          }
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

  // Função para atualizar o último jogo acessado
  const handleGameAccess = (game: Game) => {
    localStorage.setItem('lastAccessedGameId', game.id.toString());
    setActiveGame(game);
    navigate(`/moods/${game.id}`);
  };

  return (
    <Layout>
      <div className="flex min-h-screen bg-[#1A1C24]">
        <div className="flex-1">
          {/* Content */}
          <div className="p-6 flex">
            {/* Main Game Section */}
            <div className="flex-1">
              {/* Featured Game */}
              {loading ? (
                <div className="relative mb-8 rounded-xl overflow-hidden bg-[#222429] h-64 flex items-center justify-center">
                  <div className="text-white">Carregando jogos...</div>
                </div>
              ) : activeGame ? (
                <div className="relative mb-8 rounded-xl overflow-hidden">
                  <Link to="/home">
                  <img
                    src={getFullImageUrl(activeGame.imageUrl)}
                    alt={activeGame.name}
                    className="w-full h-64 object-cover"
                  />
                  </Link>
                  <div className="absolute top-0 left-0 p-4">
                    <span className="bg-[#FFD110] text-black font-medium px-4 py-1 rounded-full text-sm">
                      Último jogo
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 p-8">
                    <h2 className="text-4xl font-bold text-white mb-4">{activeGame.name}</h2>
                    <Button 
                      className="bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium"
                      onClick={() => handleGameAccess(activeGame)}
                    >
                      Acessar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative mb-8 rounded-xl overflow-hidden bg-[#222429] h-64 flex items-center justify-center">
                  <div className="text-white">Nenhum jogo disponível</div>
                </div>
              )}

              {/* Games List */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Meus jogos</h3>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="bg-[#222429] border-none overflow-hidden h-64 animate-pulse">
                        <div className="h-40 bg-[#2A2D36]"></div>
                        <CardContent className="p-4">
                          <div className="h-4 bg-[#2A2D36] rounded w-3/4 mb-2"></div>
                          <div className="h-8 bg-[#2A2D36] rounded mt-4"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : games.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.filter(game => game.name.toLowerCase() !== 'batalha').map(game => (
                      <Card key={game.id} className="bg-[#222429] border-none overflow-hidden">
                        <div className="h-40 overflow-hidden">
                          <img
                            src={getFullImageUrl(game.imageUrl)}
                            alt={game.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4 flex flex-col items-center">
                          <h4 className="text-lg font-medium text-white mb-4">{game.name}</h4>
                          <Button
                            className="w-full bg-transparent border border-[#FFD110] text-[#FFD110] hover:bg-[#FFD110] hover:text-black"
                            onClick={() => handleGameAccess(game)}
                          >
                            Acessar
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <p>Nenhum jogo encontrado. Adicione jogos para começar.</p>
                  </div>
                )}
              </div>

              {games.some(game => game.name.toLowerCase() === 'batalha') && (
                <div className="mt-10">
                  <h3 className="text-2xl font-bold text-white mb-6">Batalha de Lives</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.filter(game => game.name.toLowerCase() === 'batalha').map(battleGame => (
                      <Card key={battleGame.id} className="bg-[#222429] border-none overflow-hidden">
                        <div className="h-40 overflow-hidden">
                          <img
                            src={getFullImageUrl(battleGame.imageUrl)}
                            alt={battleGame.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4 flex flex-col items-center">
                          <h4 className="text-lg font-medium text-white mb-4">{battleGame.name}</h4>
                          <Button
                            className="w-full bg-transparent border border-[#FFD110] text-[#FFD110] hover:bg-[#FFD110] hover:text-black"
                            onClick={() => handleGameAccess(battleGame)}
                          >
                            Acessar
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top Streamers Sidebar */}
            <div className="w-72 ml-6">
              <div className="bg-[#222429] rounded-xl p-4">
                <h3 className="text-xl font-bold text-white mb-4">Top Streamer</h3>
                <div className="space-y-4">
                  {topStreamers.map(streamer => (
                    <div key={streamer.id} className="flex items-center p-3 bg-[#2A2D36] rounded-lg">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={streamer.avatar} alt={streamer.name} />
                        <AvatarFallback>{streamer.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-white">{streamer.name}</p>
                        <p className="text-sm text-gray-400">{streamer.views} Views</p>
                      </div>
                      <Star className="text-[#FFD110] ml-2" size={18} />
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium">
                  Visualizar todos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>

  );
};

export default Home;
