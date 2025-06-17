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

interface GiftPreviewData {
    user: string;
    userProfile: string;
    giftName: string;
    giftEmoji?: string;
    giftImage?: string;
    multiplier?: string;
}

interface OverlayItem {
    id: string;
    name: string;
    description: string;
    icon: JSX.Element;
    type: string;
    previewData: PreviewData[] | PreviewData | GiftPreviewData[];
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
        },
        {
            id: "gift-list",
            name: t('overlays.giftList'),
            description: t('overlays.giftListDescription'),
            icon: <Gift className="w-8 h-8 text-[#FFD110]" />,
            type: "gift-list",
            previewData: [
                { user: "User1", userProfile: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png", giftName: "Rose", giftEmoji: "🌹", multiplier: "2x" },
                { user: "User2", userProfile: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png", giftName: "Heart", giftEmoji: "❤️" },
                { user: "User3", userProfile: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png", giftName: "TikTok", giftEmoji: "🎵" }
            ]
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
                                <div className="flex flex-col gap-4">
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
                                            <Button
                                                onClick={() => handleCopyUrl(overlay.id)}
                                                className="bg-[#FFD110] hover:bg-[#FFD110]/90 text-black"
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                {t('overlays.copyUrl')}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Preview Section */}
                                    <div className="mt-4 border-t border-[#3A3D46] pt-4">
                                        {overlay.id === 'new-follower' ? (
                                            <div className="follower-container-preview">
                                                <div className="follower-title">Novo Seguidor!</div>
                                                <div className="follower-profile">
                                                    <img src={(overlay.previewData as PreviewData).profilePicture} alt={(overlay.previewData as PreviewData).name} />
                                                </div>
                                                <div className="follower-name">{(overlay.previewData as PreviewData).name}</div>
                                                <div className="follower-message">Obrigado por me seguir!</div>
                                                <div className="follower-emblems">
                                                    <div className="emblem">⭐</div>
                                                    <div className="emblem">🎉</div>
                                                    <div className="emblem">❤️</div>
                                                </div>
                                            </div>
                                        ) : overlay.id === 'gift-list' ? (
                                            <div className="gift-list-preview">
                                                {(overlay.previewData as GiftPreviewData[]).map((item, index) => (
                                                    <div key={index} className="gift-list-item">
                                                        <div className="gift-list-avatar">
                                                            <img src={item.userProfile} alt={item.user} />
                                                        </div>
                                                        <div className="gift-list-username">{item.user}</div>
                                                        <div className="gift-list-message">
                                                            {item.giftName}
                                                            <div className="gift-list-giftimg">
                                                                {item.giftEmoji}
                                                            </div>
                                                            {item.multiplier && <span className="multiplier">{item.multiplier}</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="list-preview">
                                                <div className="title">
                                                    {overlay.id === 'top-donors' ? 'Top Donors' : 'Top Likes'}
                                                </div>
                                                {(overlay.previewData as PreviewData[]).map((item, index) => (
                                                    <div key={index} className={`item ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}`}>
                                                        <div className="rank">
                                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                                        </div>
                                                        <div className="profile-picture">
                                                            <img src={item.profilePicture} alt={item.name} />
                                                        </div>
                                                        <div className="name">{item.name}</div>
                                                        <div className="value">
                                                            {item.value} {overlay.id === 'top-likes' ? '❤️' : '🪙'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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
                                ) : showPreview === 'gift-list' ? (
                                    <div className="relative">
                                        <button
                                            onClick={handleClosePreview}
                                            className="absolute -top-4 -right-4 bg-[#FFD110] text-black p-2 rounded-full hover:bg-[#FFD110]/90 transition-colors z-10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="gift-list">
                                            {(overlays[3].previewData as GiftPreviewData[]).map((item, index) => (
                                                <div key={index} className="gift-list-item">
                                                    <div className="gift-list-avatar">
                                                        <img src={item.userProfile} alt={item.user} />
                                                    </div>
                                                    <div className="gift-list-username">{item.user}</div>
                                                    <div className="gift-list-message">
                                                        {item.giftName}
                                                        <div className="gift-list-giftimg">
                                                            {item.giftEmoji}
                                                        </div>
                                                        {item.multiplier && <span className="multiplier">{item.multiplier}</span>}
                                                    </div>
                                                </div>
                                            ))}
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
                .follower-container-preview {
                    background: rgba(0, 0, 0, 0.85);
                    padding: 20px;
                    border-radius: 15px;
                    text-align: center;
                    box-shadow: 0 0 20px rgba(255, 209, 16, 0.3);
                }
                .gift-list-preview {
                    background: rgba(0, 0, 0, 0.85);
                    border-radius: 15px;
                    padding: 15px;
                    box-shadow: 0 0 20px rgba(255, 209, 16, 0.3);
                    max-height: 300px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .list-preview {
                    background: rgba(0, 0, 0, 0.85);
                    border-radius: 15px;
                    padding: 15px;
                    box-shadow: 0 0 20px rgba(255, 209, 16, 0.3);
                }
                .list-preview .item.gold {
                    border: 2px solid #FFD700;
                    box-shadow: 0 0 10px #FFD700aa;
                }
                .list-preview .item.silver {
                    border: 2px solid #C0C0C0;
                    box-shadow: 0 0 10px #C0C0C0aa;
                }
                .list-preview .item.bronze {
                    border: 2px solid #CD7F32;
                    box-shadow: 0 0 10px #CD7F32aa;
                }
                .follower-title {
                    color: #FFD110;
                    font-size: 20px;
                    margin-bottom: 10px;
                    text-shadow: 0 0 10px rgba(255, 209, 16, 0.5);
                }
                .follower-profile {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    margin: 0 auto 10px;
                    border: 3px solid #FFD110;
                    box-shadow: 0 0 15px rgba(255, 209, 16, 0.5);
                    overflow: hidden;
                }
                .follower-name {
                    color: white;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                .follower-message {
                    color: #FFD110;
                    font-size: 16px;
                    margin-bottom: 10px;
                }
                .follower-emblems {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                }
                .emblem {
                    width: 30px;
                    height: 30px;
                    background: #FFD110;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }
                .title {
                    color: #FFD110;
                    font-size: 20px;
                    margin-bottom: 15px;
                    text-align: center;
                }
                .item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                    padding: 8px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .rank {
                    font-size: 16px;
                    width: 30px;
                    text-align: center;
                }
                .profile-picture {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    margin-right: 10px;
                    border: 2px solid #FFD110;
                    overflow: hidden;
                }
                .name {
                    flex: 1;
                    font-size: 14px;
                }
                .value {
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .gift-list-item {
                    display: flex;
                    align-items: center;
                    padding: 8px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .gift-list-avatar {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    margin-right: 10px;
                    border: 2px solid #FFD110;
                    overflow: hidden;
                }
                .gift-list-username {
                    flex: 1;
                    font-size: 14px;
                }
                .gift-list-message {
                    font-size: 14px;
                    margin-right: 8px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .gift-list-message .multiplier {
                    color: #FFD110;
                    font-weight: bold;
                }
                .gift-list-giftimg {
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
            `}</style>
        </Layout>
    );
};

export default Overlays; 