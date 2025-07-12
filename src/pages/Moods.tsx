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
import Breadcrumb from "@/components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/use-profile";

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface Mood {
    id: number;
    name: string;
    imageUrl: string;
}

interface Service {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    moods: Mood[];
}

const Mods = () => {
    const { t } = useTranslation();
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
    const [showAddMoodDialog, setShowAddMoodDialog] = useState(false);
    const [newMoodForm, setNewMoodForm] = useState({
        name: "",
        image: null as File | null,
    });
    const [isAdding, setIsAdding] = useState(false);
    const [totalMoods, setTotalMoods] = useState(0);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { profile } = useProfile();

    useEffect(() => {
        fetchGameMoods();
    }, [id, refreshKey]);

    const fetchGameMoods = async () => {
        try {
            setLoading(true);
            const response = await apiRequest(`/moods/service/${id}`, { method: "GET", isAuthenticated: true });
            setMoods(response);

            // Fetch all services to count total moods
            const servicesResponse = await apiRequest('/services', { method: "GET", isAuthenticated: true });
            const totalMoodsCount = servicesResponse.reduce((acc: number, service: Service) => acc + service.moods.length, 0);
            setTotalMoods(totalMoodsCount);
        } catch (error) {
            console.error("Erro ao buscar moods:", error);
            toast({
                title: t('moods.error'),
                description: t('moods.addError'),
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const isMoodLimitExceeded = () => {
        const limit = (profile?.plan === 'premium' || profile?.plan === 'premium+creators') ? 25 : 3;
        return totalMoods > limit;
    };

    const canPerformAction = () => {
        if (profile?.plan === 'premium' || profile?.plan === 'premium+creators') return true;
        return !isMoodLimitExceeded();
    };

    const canAddNewMood = () => {
        if (profile?.plan === 'premium' || profile?.plan === 'premium+creators') return true;
        const limit = 3;
        return totalMoods < limit;
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
                title: t('moods.requiredField'),
                description: t('moods.nameRequired'),
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
                title: t('moods.success'),
                description: t('moods.updateSuccess'),
            });

            closeEditMoodDialog();
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error("Erro ao atualizar mood:", error);
            toast({
                title: t('moods.error'),
                description: t('moods.updateError'),
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
                title: t('moods.success'),
                description: t('moods.deleteSuccess'),
            });

            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error("Erro ao excluir mood:", error);
            toast({
                title: t('moods.error'),
                description: t('moods.deleteError'),
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddMoodInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewMoodForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddMoodImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewMoodForm((prev) => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const handleAddMood = async () => {
        if (!newMoodForm.name) {
            toast({
                title: t('moods.requiredField'),
                description: t('moods.nameRequired'),
                variant: "destructive",
            });
            return;
        }

        try {
            setIsAdding(true);

            const formData = new FormData();
            formData.append("name", newMoodForm.name);

            if (newMoodForm.image) {
                formData.append("image", newMoodForm.image);
            }

            const newMood = await apiRequest(`/moods/${id}`, {
                method: "POST",
                body: formData,
                headers: {},
                isAuthenticated: true,
            });

            setMoods((prevMoods) => [...prevMoods, newMood]);

            toast({
                title: t('moods.success'),
                description: t('moods.addSuccess'),
            });

            setShowAddMoodDialog(false);
            setNewMoodForm({ name: "", image: null });
        } catch (error) {
            console.error("Erro ao adicionar modo:", error);

            const errorMessage = error.response?.message || error.message || t('moods.addError');

            toast({
                title: t('moods.error'),
                description: errorMessage === "Free plan users can only have up to 3 moods."
                    ? t('moods.freePlanLimit')
                    : errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Layout>
            <Breadcrumb
                items={[
                    { label: t('common.home'), path: "/home" },
                    { label: t('navigation.games'), path: "/games" },
                    { label: t('moods.title'), path: `/games/${id}/moods` },
                ]}
            />
            <div className="min-h-screen bg-[#1A1C24] p-6">
                <h2 className="text-white text-2xl font-bold mb-6">{t('moods.title')}</h2>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#FFD110]" />
                    </div>
                ) : moods.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {moods.map((mood) => (
                            <Card key={mood.id} className="bg-[#222429] border-none">
                                <img
                                    src={mood.imageUrl.startsWith("http") ? mood.imageUrl : `${apiUrl}${mood.imageUrl}`}
                                    alt={mood.name}
                                    className="w-full h-40 object-cover"
                                />
                                <CardContent className="p-4">
                                    <h4 className="text-lg font-medium text-white mb-3">{mood.name}</h4>

                                    <div className="grid grid-cols-3 gap-2">
                                        <Button
                                            onClick={() => navigate(`/moods/${id}/mood/${mood.id}/config`)}
                                            className="col-span-1 bg-transparent border border-[#FFD110] text-[#FFD110] hover:bg-[#FFD110] hover:text-black"
                                            disabled={!canPerformAction()}
                                        >
                                            {t('moods.access')}
                                        </Button>

                                        <Button
                                            onClick={() => openEditMoodDialog(mood)}
                                            className="col-span-1 bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                                            disabled={!canPerformAction()}
                                        >
                                            <Pencil className="h-4 w-4 mr-1" /> {t('moods.edit')}
                                        </Button>
                                        
                                        <Button
                                            onClick={() => handleDeleteMood(mood.id)}
                                            className="col-span-1 bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                        >
                                            <Trash className="h-4 w-4 mr-1" /> {t('moods.delete')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">{t('moods.noMoods')}</p>
                )}

                <Card
                    className={`bg-[#222429] border-none flex items-center justify-center cursor-pointer hover:bg-[#2A2D36] ${!canAddNewMood() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => canAddNewMood() && setShowAddMoodDialog(true)}
                >
                    <CardContent className="p-4 text-center">
                        <p className="text-[#FFD110] text-4xl font-bold">+</p>
                        <p className="text-gray-400">{t('moods.addMode')}</p>
                    </CardContent>
                </Card>

                {!canAddNewMood() && (
                    <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                        <p className="text-yellow-500 text-center">
                            {profile?.plan === 'free' 
                                ? t('moods.freePlanLimit')
                                : t('moods.premiumPlanLimit')}
                        </p>
                    </div>
                )}

                <AlertDialog open={showAddMoodDialog} onOpenChange={setShowAddMoodDialog}>
                    <AlertDialogContent className="bg-[#222429] text-white border-[#2A2D36]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">{t('moods.addNewMode')}</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                {t('moods.addNewMode')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <label htmlFor="newMoodName" className="block text-white mb-1">
                                    {t('moods.modeName')}
                                </label>
                                <Input
                                    id="newMoodName"
                                    name="name"
                                    value={newMoodForm.name}
                                    onChange={handleAddMoodInputChange}
                                    className="bg-[#2A2D36] border-none text-white"
                                />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="bg-transparent border border-gray-600 text-white hover:bg-[#2A2D36]"
                                onClick={() => setShowAddMoodDialog(false)}
                            >
                                {t('moods.cancel')}
                            </AlertDialogCancel>
                            <Button
                                className="bg-[#FFD110] text-black hover:bg-[#E6C00F]"
                                onClick={handleAddMood}
                                disabled={isAdding}
                                type="button"
                            >
                                {isAdding ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('moods.adding')}
                                    </>
                                ) : (
                                    t('moods.add')
                                )}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={showEditMoodDialog} onOpenChange={setShowEditMoodDialog}>
                    <AlertDialogContent className="bg-[#222429] text-white border-[#2A2D36]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">{t('moods.editMode')}</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                                {t('moods.editMode')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <label htmlFor="editMoodName" className="block text-white mb-1">
                                    {t('moods.modeName')}
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
                                    {t('moods.newImage')}
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
                                        {t('moods.fileSelected')} {editMoodForm.image.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                className="bg-transparent border border-gray-600 text-white hover:bg-[#2A2D36]"
                                onClick={() => closeEditMoodDialog()}
                            >
                                {t('moods.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-[#FFD110] text-black hover:bg-[#E6C00F]"
                                onClick={handleUpdateMood}
                                disabled={isEditing}
                            >
                                {isEditing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('moods.saving')}
                                    </>
                                ) : (
                                    t('moods.save')
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
