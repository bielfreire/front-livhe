import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Gift, Heart, UserPlus, Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { useTranslation } from "react-i18next";
import Breadcrumb from "@/components/Breadcrumb";

interface PreviewData {
    name: string;
    value?: number;
    profilePicture: string;
}

interface OverlayItem {
    id: string;
    name: string;
    description: string;
    icon: JSX.Element;
    type: string;
    previewData: PreviewData[] | PreviewData;
}

const Overlays = () => {
    const { toast } = useToast();
    const { profile } = useProfile();
    const { t } = useTranslation();
    const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState<string | null>(null);

    const overlays: OverlayItem[] = [
        {
            id: "top-donors",
            name: t('overlays.topDonors'),
            description: t('overlays.topDonorsDescription'),
            icon: <Gift className="w-8 h-8 text-[#FFD110]" />,
            type: "donors",
            previewData: [
                { name: "User1", value: 1000, profilePicture: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png" },
                { name: "User2", value: 800, profilePicture: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png" },
                { name: "User3", value: 500, profilePicture: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png" }
            ]
        },
        {
            id: "top-likes",
            name: t('overlays.topLikes'),
            description: t('overlays.topLikesDescription'),
            icon: <Heart className="w-8 h-8 text-[#FFD110]" />,
            type: "likes",
            previewData: [
                { name: "User1", value: 5000, profilePicture: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png" },
                { name: "User2", value: 3000, profilePicture: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png" },
                { name: "User3", value: 1000, profilePicture: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png" }
            ]
        },
        {
            id: "new-follower",
            name: t('overlays.newFollower'),
            description: t('overlays.newFollowerDescription'),
            icon: <UserPlus className="w-8 h-8 text-[#FFD110]" />,
            type: "follower",
            previewData: {
                name: "NewFollower",
                profilePicture: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png"
            }
        }
    ];

    const getOverlayUrl = (overlayId: string) => {
        if (!profile) return "";
        const host = process.env.NODE_ENV === "production" ? "localhost" : window.location.hostname;
        return `http://${host}:4000/overlays/${overlayId}?userId=${profile.id}`;
    };

    const handleCopyUrl = (overlayId: string) => {
        const url = getOverlayUrl(overlayId);
        navigator.clipboard.writeText(url);
        toast({
            title: t('overlays.urlCopied'),
            description: t('overlays.urlCopiedDescription'),
        });
    };

    const handlePreview = (overlayId: string) => {
        setShowPreview(overlayId);
    };

    const handleClosePreview = () => {
        setShowPreview(null);
    };

    if (!profile) {
        return (
            <Layout>
                <div className="min-h-screen bg-[#1A1C24] p-6">
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FFD110]"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-[#1A1C24] p-6">
                <Breadcrumb items={[
                    { label: t('common.home'), path: '/home' },
                    { label: t('navigation.overlays'), path: '/overlays' }
                ]} />

                <div className="mt-6">
                    <h1 className="text-2xl font-bold text-white mb-6">{t('overlays.title')}</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {overlays.map((overlay) => (
                            <Card key={overlay.id} className="bg-[#2A2D36] border-[#3A3D46] p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-[#3A3D46] rounded-lg">
                                        {overlay.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-white mb-2">
                                            {overlay.name}
                                        </h3>
                                        <p className="text-gray-400 mb-4">
                                            {overlay.description}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleCopyUrl(overlay.id)}
                                                className="bg-[#FFD110] hover:bg-[#FFD110]/90 text-black"
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                {t('overlays.copyUrl')}
                                            </Button>
                                            <Button
                                                onClick={() => handlePreview(overlay.id)}
                                                variant="outline"
                                                className="bg-[#FFD110] hover:bg-[#FFD110]/90 text-black"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                {t('overlays.preview')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Preview Overlay */}
                    {showPreview && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="relative w-full max-w-2xl">
                                {showPreview === 'new-follower' ? (
                                    <div className="follower-container relative">
                                        <button
                                            onClick={handleClosePreview}
                                            className="absolute top-2 right-2 bg-[#FFD110] text-black p-2 rounded-full hover:bg-[#FFD110]/90 transition-colors z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="follower-title">Novo Seguidor!</div>
                                        <div className="follower-profile">
                                            <img src={(overlays[2].previewData as PreviewData).profilePicture} alt={(overlays[2].previewData as PreviewData).name} />
                                        </div>
                                        <div className="follower-name">{(overlays[2].previewData as PreviewData).name}</div>
                                        <div className="follower-message">Obrigado por me seguir!</div>
                                        <div className="follower-emblems">
                                            <div className="emblem">⭐</div>
                                            <div className="emblem">🎉</div>
                                            <div className="emblem">❤️</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <button
                                            onClick={handleClosePreview}
                                            className="absolute -top-4 -right-4 bg-[#FFD110] text-black p-2 rounded-full hover:bg-[#FFD110]/90 transition-colors z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="list">
                                            <div className="title">
                                                {showPreview === 'top-donors' ? 'Top Donors' : 'Top Likes'}
                                            </div>
                                            {(overlays.find(o => o.id === showPreview)?.previewData as PreviewData[]).map((item, index) => (
                                                <div key={index} className={`item ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}`}>
                                                    <div className="rank">
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                    </div>
                                                    <div className="profile-picture">
                                                        <img src={item.profilePicture} alt={item.name} />
                                                    </div>
                                                    <div className="name">{item.name}</div>
                                                    <div className="value">
                                                        {item.value} {showPreview === 'top-likes' ? '❤️' : '🪙'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .follower-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.85);
                    padding: 30px;
                    border-radius: 20px;
                    text-align: center;
                    border: 2px solid #FFD110;
                    box-shadow: 0 0 20px rgba(255, 209, 16, 0.3);
                }
                .follower-title {
                    color: #FFD110;
                    font-size: 24px;
                    margin-bottom: 15px;
                    text-shadow: 0 0 10px rgba(255, 209, 16, 0.5);
                }
                .follower-profile {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    margin: 0 auto 15px;
                    border: 3px solid #FFD110;
                    box-shadow: 0 0 15px rgba(255, 209, 16, 0.5);
                    overflow: hidden;
                    animation: pulse 2s infinite;
                }
                .follower-profile img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .follower-name {
                    color: white;
                    font-size: 32px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                }
                .follower-message {
                    color: #FFD110;
                    font-size: 20px;
                    margin-bottom: 15px;
                }
                .follower-emblems {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 20px;
                }
                .emblem {
                    width: 40px;
                    height: 40px;
                    background: #FFD110;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    animation: rotate 2s linear infinite;
                }
                .list {
                    background: rgba(0, 0, 0, 0.85);
                    border-radius: 20px;
                    padding: 20px;
                    border: 2px solid #FFD110;
                    box-shadow: 0 0 20px rgba(255, 209, 16, 0.3);
                }
                .title {
                    color: #FFD110;
                    font-size: 24px;
                    margin-bottom: 20px;
                    text-align: center;
                    text-shadow: 0 0 10px rgba(255, 209, 16, 0.5);
                }
                .item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                    padding: 10px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    transition: all 0.3s ease;
                }
                .rank {
                    font-size: 20px;
                    font-weight: bold;
                    width: 40px;
                    text-align: center;
                }
                .profile-picture {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    margin-right: 15px;
                    border: 2px solid #FFD110;
                    box-shadow: 0 0 10px rgba(255, 209, 16, 0.3);
                    overflow: hidden;
                }
                .profile-picture img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .name {
                    flex: 1;
                    font-size: 18px;
                    font-weight: 500;
                }
                .value {
                    font-size: 18px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .gold { border: 2px solid #FFD700; box-shadow: 0 0 10px #FFD700aa; }
                .silver { border: 2px solid #C0C0C0; box-shadow: 0 0 10px #C0C0C0aa; }
                .bronze { border: 2px solid #CD7F32; box-shadow: 0 0 10px #CD7F32aa; }
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </Layout>
    );
};

export default Overlays; 