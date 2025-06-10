import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface Streamer {
  id: number;
  username: string;
  totalViews: number;
  currentViews: number;
  isLive: boolean;
  tiktokUrl?: string;
}

const Home = () => {
  const { t } = useTranslation();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [topStreamers, setTopStreamers] = useState<Streamer[]>([]);
  const [showAllStreamers, setShowAllStreamers] = useState(false);

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

  useEffect(() => {
    const fetchTopStreamers = async () => {
      try {
        const response = await apiRequest('/streamers/top', {
          method: 'GET',
          isAuthenticated: true
        });
        const streamers = Array.isArray(response) ? response : response.data || [];
        const sortedStreamers = streamers.sort((a, b) => b.currentViews - a.currentViews);
        setTopStreamers(sortedStreamers);
      } catch (error) {
        console.error('Erro ao buscar top streamers:', error);
        setTopStreamers([]);
      }
    };

    fetchTopStreamers();
    const interval = setInterval(fetchTopStreamers, 30000);

    return () => clearInterval(interval);
  }, []);

  // Função para obter URL completa da imagem
  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:4000${url}`;
  };

  // Função para atualizar o último jogo acessado
  const handleGameAccess = (game: Game) => {
    // console.log("Acessando jogo:", game);
    localStorage.setItem('lastAccessedGameId', game.id.toString());
    setActiveGame(game);
    if (game.name.toLowerCase() === 'batalha') {
      navigate(`/battle/${game.id}`);
    }
    else {
      navigate(`/moods/${game.id}`);
    }
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
                  <div className="text-white">{t('home.loadingGames')}</div>
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
                      {t('home.lastGame')}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 p-8">
                    <h2 className="text-4xl font-bold text-white mb-4">{activeGame.name}</h2>
                    <Button
                      className="bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium"
                      onClick={() => handleGameAccess(activeGame)}
                    >
                      {t('home.access')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative mb-8 rounded-xl overflow-hidden bg-[#222429] h-64 flex items-center justify-center">
                  <div className="text-white">{t('home.noGamesAvailable')}</div>
                </div>
              )}

              {/* Games List */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">{t('home.myGames')}</h3>
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
                            {t('home.access')}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <p>{t('home.noGamesFound')}</p>
                  </div>
                )}
              </div>

              {games.some(game => game.name.toLowerCase() === 'batalha') && (
                <div className="mt-10">
                  <h3 className="text-2xl font-bold text-white mb-6">{t('home.battleLives')}</h3>
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
                            {t('home.access')}
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
                <h3 className="text-xl font-bold text-white mb-4">{t('home.topStreamer')}</h3>
                <div className="space-y-4">
                  {topStreamers && topStreamers.length > 0 ? (
                    topStreamers.slice(0, 4).map((streamer, index) => (
                      <div key={streamer.id} className="flex items-center p-3 bg-[#2A2D36] rounded-lg">
                        <div className="flex items-center justify-center w-8 mr-2">
                          {index === 0 ? (
                            <span className="text-[#FFD110] text-xl">⭐</span>
                          ) : (
                            <span className="text-gray-400 font-bold">{index + 1}</span>
                          )}
                        </div>
                        <Avatar className="h-12 w-12 mr-3">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {streamer.username.charAt(1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <a 
                            href={`https://www.tiktok.com/${streamer.username.startsWith('@') ? streamer.username : '@' + streamer.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-white hover:text-[#FFD110] transition-colors"
                          >
                            {streamer.username.startsWith('@') ? streamer.username : '@' + streamer.username}
                          </a>
                          <p className="text-sm text-gray-400">{streamer.currentViews.toLocaleString()} {t('home.views')}</p>
                        </div>
                        {streamer.isLive && (
                          <span className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">
                            {t('home.live')}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-4">
                      {t('home.noStreamersAvailable')}
                    </div>
                  )}
                </div>
                {topStreamers.length > 4 && (
                  <Button 
                    className="w-full mt-4 bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium"
                    onClick={() => setShowAllStreamers(true)}
                  >
                    {t('home.viewAll')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para mostrar todos os streamers */}
      <Dialog open={showAllStreamers} onOpenChange={setShowAllStreamers}>
        <DialogContent className="bg-[#222429] border-none text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">{t('home.allStreamers')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[60vh] overflow-y-auto">
            {topStreamers.map((streamer, index) => (
              <div key={streamer.id} className="flex items-center p-3 bg-[#2A2D36] rounded-lg">
                <div className="flex items-center justify-center w-8 mr-2">
                  {index === 0 ? (
                    <span className="text-[#FFD110] text-xl">⭐</span>
                  ) : (
                    <span className="text-gray-400 font-bold">{index + 1}</span>
                  )}
                </div>
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {streamer.username.charAt(1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <a 
                    href={`https://www.tiktok.com/${streamer.username.startsWith('@') ? streamer.username : '@' + streamer.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-white hover:text-[#FFD110] transition-colors"
                  >
                    {streamer.username.startsWith('@') ? streamer.username : '@' + streamer.username}
                  </a>
                  <p className="text-sm text-gray-400">{streamer.currentViews.toLocaleString()} {t('home.views')}</p>
                </div>
                {streamer.isLive && (
                  <span className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full">
                    {t('home.live')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Home;
