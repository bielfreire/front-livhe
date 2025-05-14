import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ConfirmModal } from "@/components/ConfirmModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

interface Game {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  moods: Mood[];
}

interface Mood {
  id: number;
  name: string;
  imageUrl: string;
}

const Admin = () => {
  const { profile, isLoading } = useProfile();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [gameForm, setGameForm] = useState({
    name: "",
    description: "",
    image: null as File | null,
  });
  const [moodForm, setMoodForm] = useState({
    name: "",
    image: null as File | null,
  });
  const [editGameForm, setEditGameForm] = useState({
    id: 0,
    name: "",
    description: "",
    image: null as File | null,
  });
  const [editMoodForm, setEditMoodForm] = useState({
    id: 0,
    name: "",
    image: null as File | null,
  });
  const [loading, setLoading] = useState({
    games: false,
    createGame: false,
    createMood: false,
    updateGame: false,
    updateMood: false,
    deleteGame: false,
    deleteMood: false,
  });
  const [showEditGameDialog, setShowEditGameDialog] = useState(false);
  const [showEditMoodDialog, setShowEditMoodDialog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchGames();
  }, [refreshKey]);

  const fetchGames = async () => {
    try {
      setLoading((prev) => ({ ...prev, games: true }));
      const response = await apiRequest("/services", {
        method: "GET",
        isAuthenticated: true,
      });
      setGames(response || []);

      if (selectedGame) {
        const updatedSelectedGame = response.find((game: Game) => game.id === selectedGame.id);
        if (updatedSelectedGame) {
          setSelectedGame(updatedSelectedGame);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os jogos.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, games: false }));
    }
  };

  const handleGameInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGameForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditGameInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditGameForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGameImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGameForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleEditGameImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditGameForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const openEditGameDialog = (game: Game) => {
    setEditGameForm({
      id: game.id,
      name: game.name,
      description: game.description,
      image: null,
    });
    setShowEditGameDialog(true);
  };

  const closeEditGameDialog = () => {
    setShowEditGameDialog(false);
  };

  const handleMoodInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMoodForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditMoodInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditMoodForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMoodImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMoodForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleEditMoodImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditMoodForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const openEditMoodDialog = (mood: Mood) => {
    setEditMoodForm({
      id: mood.id,
      name: mood.name,
      image: null,
    });
    setShowEditMoodDialog(true);
  };

  const closeEditMoodDialog = () => {
    setShowEditMoodDialog(false);
  };

  const handleCreateGame = async () => {
    if (!gameForm.name || !gameForm.description || !gameForm.image) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar um jogo.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, createGame: true }));

      const formData = new FormData();
      formData.append("name", gameForm.name);
      formData.append("description", gameForm.description);
      formData.append("image", gameForm.image);

      const newGame = await apiRequest("/services", {
        method: "POST",
        body: formData,
        headers: {},
        isAuthenticated: true,
      });

      setGames(prevGames => [...prevGames, newGame]);

      toast({
        title: "Sucesso",
        description: "Jogo criado com sucesso!",
      });

      setGameForm({
        name: "",
        description: "",
        image: null,
      });

      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao criar jogo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o jogo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, createGame: false }));
    }
  };

  const handleAddMood = async () => {
    if (!selectedGame) {
      toast({
        title: "Selecione um jogo",
        description: "Você precisa selecionar um jogo para adicionar um mood.",
        variant: "destructive",
      });
      return;
    }

    if (!moodForm.name || !moodForm.image) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar um mood.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, createMood: true }));

      const formData = new FormData();
      formData.append("name", moodForm.name);
      formData.append("image", moodForm.image);

      const newMood = await apiRequest(`/moods/${selectedGame.id}`, {
        method: "POST",
        body: formData,
        headers: {},
        isAuthenticated: true,
      });

      if (selectedGame) {
        setSelectedGame({
          ...selectedGame,
          moods: [...selectedGame.moods, newMood]
        });
      }

      toast({
        title: "Sucesso",
        description: "Mood adicionado com sucesso!",
      });

      setMoodForm({
        name: "",
        image: null,
      });

      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao adicionar mood:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o mood. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, createMood: false }));
    }
  };

  const handleUpdateGame = async () => {
    if (!editGameForm.name || !editGameForm.description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para atualizar o jogo.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, updateGame: true }));

      const formData = new FormData();
      formData.append("name", editGameForm.name);
      formData.append("description", editGameForm.description);
      
      if (editGameForm.image) {
        formData.append("image", editGameForm.image);
      }

      const updatedGame = await apiRequest(`/services/${editGameForm.id}`, {
        method: "PATCH",
        body: formData,
        headers: {},
        isAuthenticated: true,
      });

      setGames(prevGames => 
        prevGames.map(game => 
          game.id === updatedGame.id ? updatedGame : game
        )
      );

      if (selectedGame && selectedGame.id === updatedGame.id) {
        setSelectedGame(updatedGame);
      }

      toast({
        title: "Sucesso",
        description: "Jogo atualizado com sucesso!",
      });

      closeEditGameDialog();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao atualizar jogo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o jogo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, updateGame: false }));
    }
  };

  const handleUpdateMood = async () => {
    if (!editMoodForm.name) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para atualizar o mood.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, updateMood: true }));

      const formData = new FormData();
      formData.append("name", editMoodForm.name);
      
      if (editMoodForm.image) {
        formData.append("image", editMoodForm.image);
      }

      const updatedMood = await apiRequest(`/moods/${editMoodForm.id}`, {
        method: "PATCH",
        body: formData,
        headers: {},
        isAuthenticated: true,
      });

      setGames(prevGames => 
        prevGames.map(game => ({
          ...game,
          moods: game.moods.map(mood => 
            mood.id === updatedMood.id ? updatedMood : mood
          )
        }))
      );

      if (selectedGame) {
        setSelectedGame({
          ...selectedGame,
          moods: selectedGame.moods.map(mood => 
            mood.id === updatedMood.id ? updatedMood : mood
          )
        });
      }

      toast({
        title: "Sucesso",
        description: "Mood atualizado com sucesso!",
      });

      closeEditMoodDialog();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao atualizar mood:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o mood. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, updateMood: false }));
    }
  };

  const handleDeleteGame = async (gameId: number) => {
    try {
      setLoading((prev) => ({ ...prev, deleteGame: true }));
      
      await apiRequest(`/services/${gameId}`, {
        method: "DELETE",
        isAuthenticated: true,
      });

      setGames(prevGames => prevGames.filter(game => game.id !== gameId));

      toast({
        title: "Sucesso",
        description: "Jogo excluído com sucesso!",
      });

      if (selectedGame?.id === gameId) {
        setSelectedGame(null);
      }
      
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao excluir jogo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o jogo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, deleteGame: false }));
    }
  };

  const handleDeleteMood = async (moodId: number) => {
    try {
      setLoading((prev) => ({ ...prev, deleteMood: true }));
      
      await apiRequest(`/moods/${moodId}`, {
        method: "DELETE",
        isAuthenticated: true,
      });

      setGames(prevGames => 
        prevGames.map(game => ({
          ...game,
          moods: game.moods.filter(mood => mood.id !== moodId)
        }))
      );

      if (selectedGame) {
        setSelectedGame({
          ...selectedGame,
          moods: selectedGame.moods.filter(mood => mood.id !== moodId)
        });
      }

      toast({
        title: "Sucesso",
        description: "Mood excluído com sucesso!",
      });
      
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao excluir mood:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o mood. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading((prev) => ({ ...prev, deleteMood: false }));
    }
  };

  const getFullImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `http://localhost:4000${url}`;
  };

  // Enquanto carrega, pode mostrar um loading
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Se não for admin, mostra mensagem de acesso restrito
  if (!profile || profile.role !== "admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-red-500">Acesso restrito: apenas administradores</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-[#1A1C24] min-h-screen">
        <h1 className="text-2xl font-bold text-white mb-6">Painel de Administração</h1>

        <Tabs defaultValue="games" className="w-full">
          <TabsList className="mb-6 bg-[#222429] border-b border-[#2A2D36]">
            <TabsTrigger value="games" className="text-white data-[state=active]:bg-[#FFD110] data-[state=active]:text-black">
              Jogos
            </TabsTrigger>
            <TabsTrigger value="moods" className="text-white data-[state=active]:bg-[#FFD110] data-[state=active]:text-black">
              Moods
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-6">
            <Card className="bg-[#222429] border-none">
              <CardHeader>
                <CardTitle className="text-white">Criar Novo Jogo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-white mb-1">
                    Nome do Jogo
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={gameForm.name}
                    onChange={handleGameInputChange}
                    className="bg-[#2A2D36] border-none text-white"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-white mb-1">
                    Descrição
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={gameForm.description}
                    onChange={handleGameInputChange}
                    className="bg-[#2A2D36] border-none text-white"
                  />
                </div>

                <div>
                  <label htmlFor="gameImage" className="block text-white mb-1">
                    Imagem
                  </label>
                  <Input
                    id="gameImage"
                    type="file"
                    accept="image/*"
                    onChange={handleGameImageChange}
                    className="bg-[#2A2D36] border-none text-white"
                  />
                  {gameForm.image && (
                    <p className="text-green-500 text-sm mt-1">
                      Arquivo selecionado: {gameForm.image.name}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleCreateGame}
                  disabled={loading.createGame}
                  className="bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium mt-2"
                >
                  {loading.createGame ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Jogo"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#222429] border-none">
              <CardHeader>
                <CardTitle className="text-white">Jogos Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.games ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin text-[#FFD110]" />
                  </div>
                ) : games.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {games.map((game) => (
                      <Card
                        key={game.id}
                        className={`bg-[#2A2D36] border-none cursor-pointer hover:bg-[#3A3D46] transition ${
                          selectedGame?.id === game.id
                            ? "ring-2 ring-[#FFD110]"
                            : ""
                        }`}
                        onClick={() => setSelectedGame(game)}
                      >
                        <CardContent className="p-4">
                          <div className="h-32 overflow-hidden mb-2">
                            <img
                              src={getFullImageUrl(game.imageUrl)}
                              alt={game.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <h3 className="text-white font-medium">{game.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">
                            {game.moods?.length || 0} moods
                          </p>
                          <div className="flex justify-between mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditGameDialog(game);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Editar
                            </Button>
                            <ConfirmModal
                              title="Excluir Jogo"
                              description={`Tem certeza que deseja excluir o jogo "${game.name}"? Esta ação não pode ser desfeita.`}
                              onConfirm={() => handleDeleteGame(game.id)}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash className="h-4 w-4 mr-1" /> Excluir
                                </Button>
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">Nenhum jogo encontrado.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moods" className="space-y-6">
            <Card className="bg-[#222429] border-none">
              <CardHeader>
                <CardTitle className="text-white">Adicionar Mood a um Jogo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="gameSelect" className="block text-white mb-1">
                    Selecione um Jogo
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {games.map((game) => (
                      <Card
                        key={game.id}
                        className={`bg-[#2A2D36] border-none cursor-pointer hover:bg-[#3A3D46] transition ${
                          selectedGame?.id === game.id
                            ? "ring-2 ring-[#FFD110]"
                            : ""
                        }`}
                        onClick={() => setSelectedGame(game)}
                      >
                        <CardContent className="p-4">
                          <div className="h-20 overflow-hidden mb-2">
                            <img
                              src={getFullImageUrl(game.imageUrl)}
                              alt={game.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <h3 className="text-white font-medium text-sm">{game.name}</h3>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedGame ? (
                  <>
                    <div>
                      <label htmlFor="moodName" className="block text-white mb-1">
                        Nome do Mood
                      </label>
                      <Input
                        id="moodName"
                        name="name"
                        value={moodForm.name}
                        onChange={handleMoodInputChange}
                        className="bg-[#2A2D36] border-none text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="moodImage" className="block text-white mb-1">
                        Imagem do Mood
                      </label>
                      <Input
                        id="moodImage"
                        type="file"
                        accept="image/*"
                        onChange={handleMoodImageChange}
                        className="bg-[#2A2D36] border-none text-white"
                      />
                      {moodForm.image && (
                        <p className="text-green-500 text-sm mt-1">
                          Arquivo selecionado: {moodForm.image.name}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleAddMood}
                      disabled={loading.createMood}
                      className="bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium mt-2"
                    >
                      {loading.createMood ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adicionando...
                        </>
                      ) : (
                        "Adicionar Mood"
                      )}
                    </Button>
                  </>
                ) : (
                  <p className="text-[#FFD110]">
                    ⚠️ Selecione um jogo para adicionar um mood
                  </p>
                )}
              </CardContent>
            </Card>

            {selectedGame && (
              <Card className="bg-[#222429] border-none">
                <CardHeader>
                  <CardTitle className="text-white">
                    Moods do Jogo: {selectedGame.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedGame.moods && selectedGame.moods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedGame.moods.map((mood) => (
                        <Card key={mood.id} className="bg-[#2A2D36] border-none">
                          <CardContent className="p-4">
                            <div className="h-32 overflow-hidden mb-2">
                              <img
                                src={getFullImageUrl(mood.imageUrl)}
                                alt={mood.name}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                            <h3 className="text-white font-medium">{mood.name}</h3>
                            <div className="flex justify-between mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                                onClick={() => openEditMoodDialog(mood)}
                              >
                                <Pencil className="h-4 w-4 mr-1" /> Editar
                              </Button>
                              <ConfirmModal
                                title="Excluir Mood"
                                description={`Tem certeza que deseja excluir o mood "${mood.name}"? Esta ação não pode ser desfeita.`}
                                onConfirm={() => handleDeleteMood(mood.id)}
                                trigger={
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  >
                                    <Trash className="h-4 w-4 mr-1" /> Excluir
                                  </Button>
                                }
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">
                      Este jogo ainda não possui moods.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={showEditGameDialog} onOpenChange={setShowEditGameDialog}>
          <AlertDialogContent className="bg-[#222429] text-white border-[#2A2D36]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Editar Jogo</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Faça as alterações necessárias nos campos abaixo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="editName" className="block text-white mb-1">
                  Nome do Jogo
                </label>
                <Input
                  id="editName"
                  name="name"
                  value={editGameForm.name}
                  onChange={handleEditGameInputChange}
                  className="bg-[#2A2D36] border-none text-white"
                />
              </div>

              <div>
                <label htmlFor="editDescription" className="block text-white mb-1">
                  Descrição
                </label>
                <Textarea
                  id="editDescription"
                  name="description"
                  value={editGameForm.description}
                  onChange={handleEditGameInputChange}
                  className="bg-[#2A2D36] border-none text-white"
                />
              </div>

              <div>
                <label htmlFor="editGameImage" className="block text-white mb-1">
                  Nova Imagem (opcional)
                </label>
                <Input
                  id="editGameImage"
                  type="file"
                  accept="image/*"
                  onChange={handleEditGameImageChange}
                  className="bg-[#2A2D36] border-none text-white"
                />
                {editGameForm.image && (
                  <p className="text-green-500 text-sm mt-1">
                    Arquivo selecionado: {editGameForm.image.name}
                  </p>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="bg-transparent border border-gray-600 text-white hover:bg-[#2A2D36]"
                onClick={() => closeEditGameDialog()}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-[#FFD110] text-black hover:bg-[#E6C00F]"
                onClick={handleUpdateGame}
                disabled={loading.updateGame}
              >
                {loading.updateGame ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showEditMoodDialog} onOpenChange={setShowEditMoodDialog}>
          <AlertDialogContent className="bg-[#222429] text-white border-[#2A2D36]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Editar Mood</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Faça as alterações necessárias nos campos abaixo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="editMoodName" className="block text-white mb-1">
                  Nome do Mood
                </label>
                <Input
                  id="editMoodName"
                  name="name"
                  value={editMoodForm.name}
                  onChange={handleEditMoodInputChange}
                  className="bg-[#2A2D36] border-none text-white"
                />
              </div>

              <div>
                <label htmlFor="editMoodImage" className="block text-white mb-1">
                  Nova Imagem (opcional)
                </label>
                <Input
                  id="editMoodImage"
                  type="file"
                  accept="image/*"
                  onChange={handleEditMoodImageChange}
                  className="bg-[#2A2D36] border-none text-white"
                />
                {editMoodForm.image && (
                  <p className="text-green-500 text-sm mt-1">
                    Arquivo selecionado: {editMoodForm.image.name}
                  </p>
                )}
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="bg-transparent border border-gray-600 text-white hover:bg-[#2A2D36]"
                onClick={() => closeEditMoodDialog()}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-[#FFD110] text-black hover:bg-[#E6C00F]"
                onClick={handleUpdateMood}
                disabled={loading.updateMood}
              >
                {loading.updateMood ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Admin;
