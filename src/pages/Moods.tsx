import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "@/utils/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Trash } from "lucide-react";

interface Mood {
    id: number;
    name: string;
    imageUrl: string;
}

const Mods = () => {
    const { id } = useParams();
    const [moods, setMoods] = useState<Mood[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditMoodDialog, setShowEditMoodDialog] = useState(false);
    const [editMoodForm, setEditMoodForm] = useState({
        id: 0,
        name: "",
        image: null as File | null,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetchGameMoods();
    }, [id, refreshKey]);

    const fetchGameMoods = async () => {
        try {
            setLoading(true);
            const response = await apiRequest("/services", { method: "GET", isAuthenticated: true });

            const game = response.find((game: any) => game.id === Number(id));
            if (game) setMoods(game.moods);
        } catch (error) {
            console.error("Erro ao buscar moods:", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os moods deste jogo.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEditMoodInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditMoodForm((prev) => ({ ...prev, [name]: value }));
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

    const handleUpdateMood = async () => {
        if (!editMoodForm.name) {
            toast({
                title: "Campo obrigatório",
                description: "O nome do mood é obrigatório.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsEditing(true);

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

            setMoods(prevMoods => 
                prevMoods.map(mood => 
                    mood.id === updatedMood.id ? updatedMood : mood
                )
            );

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
            setIsEditing(false);
        }
    };

    const handleDeleteMood = async (moodId: number) => {
        try {
            setIsDeleting(true);
            
            await apiRequest(`/moods/${moodId}`, {
                method: "DELETE",
                isAuthenticated: true,
            });

            setMoods(prevMoods => prevMoods.filter(mood => mood.id !== moodId));

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
            setIsDeleting(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#1A1C24] p-6">
                <h2 className="text-white text-2xl font-bold mb-6">Mods do Jogo</h2>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#FFD110]" />
                    </div>
                ) : moods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {moods.map((mood) => (
                            <Card key={mood.id} className="bg-[#222429] border-none">
                                <img 
                                    src={`http://localhost:4000${mood.imageUrl}`} 
                                    alt={mood.name} 
                                    className="w-full h-40 object-cover" 
                                />
                                <CardContent className="p-4">
                                    <h4 className="text-lg font-medium text-white mb-3">{mood.name}</h4>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                        <Button
                                            onClick={() => navigate(`/moods/${id}/mood/${mood.id}/config`)}
                                            className="col-span-1 bg-transparent border border-[#FFD110] text-[#FFD110] hover:bg-[#FFD110] hover:text-black"
                                        >
                                            Acessar
                                        </Button>
                                        
                                        {/* <Button
                                            onClick={() => openEditMoodDialog(mood)}
                                            className="col-span-1 bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
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
                                                    className="col-span-1 bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                                >
                                                    <Trash className="h-4 w-4 mr-1" /> Excluir
                                                </Button>
                                            }
                                        /> */}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">Nenhum mod encontrado para este jogo.</p>
                )}

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
                                disabled={isEditing}
                            >
                                {isEditing ? (
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

export default Mods;
