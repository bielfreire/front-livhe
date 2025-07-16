import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Gift, Heart, UserPlus, Eye, X, Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { useTranslation } from "react-i18next";
import Breadcrumb from "@/components/Breadcrumb";
import { testOverlay } from "@/utils/api";

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
    isNew?: boolean;
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
    const [isTesting, setIsTesting] = useState<string | null>(null);
    const [testData, setTestData] = useState<any>(null);

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
                { 
                    user: "User1", 
                    userProfile: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png", 
                    giftName: "Go Popular",
                    giftImage: "https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/b342e28d73dac6547e0b3e2ad57f6597.png~tplv-obj.webp",
                    multiplier: "2x"
                },
                { 
                    user: "User2", 
                    userProfile: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png", 
                    giftName: "Heart Me",
                    giftImage: "https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/d56945782445b0b8c8658ed44f894c7b~tplv-obj.webp"
                },
                { 
                    user: "User3", 
                    userProfile: "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png", 
                    giftName: "Club Cheers",
                    giftImage: "https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/resource/6a934c90e5533a4145bed7eae66d71bd.png~tplv-obj.webp",
                    multiplier: "3x"
                }
            ]
        }
    ];

    // Fictional user data for testing
    const fictionalUsers = [
        { 
            name: "João123", 
            profilePicture: "https://i.pravatar.cc/150?img=1"
        },
        { 
            name: "Maria456", 
            profilePicture: "https://i.pravatar.cc/150?img=5"
        },
        { 
            name: "Pedro789", 
            profilePicture: "https://i.pravatar.cc/150?img=8"
        },
        { 
            name: "Ana321", 
            profilePicture: "https://i.pravatar.cc/150?img=9"
        },
        // { 
        //     name: "Lucas654", 
        //     profilePicture: "https://i.pravatar.cc/150?img=12"
        // },
    ];

    const gifts = [
        {
            id: 13651,
            name: "Go Popular",
            diamond_count: 1,
            image_url: "https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/b342e28d73dac6547e0b3e2ad57f6597.png~tplv-obj.webp"
        },
        {
            id: 7934,
            name: "Heart Me",
            diamond_count: 1,
            image_url: "https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/d56945782445b0b8c8658ed44f894c7b~tplv-obj.webp"
        },
        {
            id: 12355,
            name: "Club Cheers",
            diamond_count: 1,
            image_url: "https://p16-webcast.tiktokcdn.com/img/maliva/webcast-va/resource/6a934c90e5533a4145bed7eae66d71bd.png~tplv-obj.webp"
        },
        {
            id: 15232,
            name: "You're awesome",
            diamond_count: 1,
            image_url: "https://p16-webcast.tiktokcdn.com/img/alisg/webcast-sg/resource/e9cafce8279220ed26016a71076d6a8a.png~tplv-obj.webp"
        }
    ];

    const generateRandomValue = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const simulateData = (overlayId: string) => {
        try {
            switch(overlayId) {
                case 'top-donors':
                    return fictionalUsers.map(user => ({
                        ...user,
                        value: generateRandomValue(100, 1000)
                    })).sort((a, b) => b.value - a.value);
                
                case 'top-likes':
                    return fictionalUsers.map(user => ({
                        ...user,
                        value: generateRandomValue(1000, 5000)
                    })).sort((a, b) => b.value - a.value);
                
                case 'new-follower':
                    const randomUser = fictionalUsers[Math.floor(Math.random() * fictionalUsers.length)];
                    return {
                        name: randomUser.name,
                        profilePicture: randomUser.profilePicture
                    };
                
                case 'gift-list':
                    return fictionalUsers.map((user, index) => {
                        const gift = gifts[Math.floor(Math.random() * gifts.length)];
                        return {
                            user: user.name,
                            userProfile: user.profilePicture,
                            giftName: gift.name,
                            giftImage: gift.image_url,
                            multiplier: Math.random() > 0.5 ? `${generateRandomValue(2, 5)}x` : undefined,
                            isNew: index === fictionalUsers.length - 1 // Marca o último item como novo presente
                        };
                    });
                default:
                    return [];
            }
        } catch (error) {
            console.error('Error in simulateData:', error);
            return [];
        }
    };

    const getOverlayUrl = (overlayId: string) => {
        if (!profile || !overlayId) return "";
        const host = process.env.NODE_ENV === "production" ? "localhost" : window.location.hostname;
        return `http://${host}:4000/overlays/${overlayId}?userId=${profile.id}.livhe`;
    };

    const handleCopyUrl = (overlayId: string) => {
        if (!overlayId) {
            console.error('overlayId is undefined or empty');
            toast({
                title: "Erro",
                description: "ID do overlay não encontrado",
                variant: "destructive",
            });
            return;
        }
        
        const url = getOverlayUrl(overlayId);
        if (!url) {
            console.error('Failed to generate URL');
            toast({
                title: "Erro",
                description: "Não foi possível gerar a URL",
                variant: "destructive",
            });
            return;
        }
        
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

    const handleTest = async (overlayId: string) => {
        try {
            setIsTesting(overlayId);
            const data = simulateData(overlayId);
            setTestData(data);
            
            // Enviar dados de teste para o backend
            await testOverlay(overlayId, data);
            
            // Mostrar mensagem informando que o teste está ativo na URL
            toast({
                title: t('overlays.testStarted'),
                description: t('overlays.testStartedDescription'),
            });
            
            // Update data every 2 seconds
            const interval = setInterval(async () => {
                const newData = simulateData(overlayId);
                setTestData(newData);
                
                // Enviar novos dados para o backend
                try {
                    await testOverlay(overlayId, newData);
                } catch (error) {
                    console.error('Error sending test data to backend:', error);
                }
            }, 2000);

            // Para gift-list, adicionar novos presentes periodicamente
            if (overlayId === 'gift-list') {
                const newGiftInterval = setInterval(async () => {
                    const currentData = testData || data;
                    const newGift = {
                        user: fictionalUsers[Math.floor(Math.random() * fictionalUsers.length)].name,
                        userProfile: fictionalUsers[Math.floor(Math.random() * fictionalUsers.length)].profilePicture,
                        giftName: gifts[Math.floor(Math.random() * gifts.length)].name,
                        giftImage: gifts[Math.floor(Math.random() * gifts.length)].image_url,
                        multiplier: Math.random() > 0.5 ? `${generateRandomValue(2, 5)}x` : undefined,
                        isNew: true
                    };
                    
                    const updatedData = [...(currentData as GiftPreviewData[]).slice(0, 4), newGift];
                    setTestData(updatedData);
                    
                    try {
                        await testOverlay(overlayId, updatedData);
                    } catch (error) {
                        console.error('Error sending new gift data to backend:', error);
                    }
                }, 3000); // Novo presente a cada 3 segundos

                // Limpar o intervalo de novos presentes
                setTimeout(() => {
                    clearInterval(newGiftInterval);
                }, 10000);
            }

            // Stop test after 10 seconds
            setTimeout(() => {
                clearInterval(interval);
                setIsTesting(null);
                setTestData(null);
                
                // Mostrar mensagem de fim do teste
                toast({
                    title: t('overlays.testEnded'),
                    description: t('overlays.testEndedDescription'),
                });
            }, 10000);
        } catch (error) {
            console.error('Error in handleTest:', error);
            setIsTesting(null);
            setTestData(null);
            
            toast({
                title: t('overlays.testError'),
                description: t('overlays.testErrorDescription'),
                variant: "destructive",
            });
        }
    };

    const handleStopTest = () => {
        setIsTesting(null);
        setTestData(null);
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

    const renderPreviewContent = (overlay: OverlayItem) => {
        try {
            if (overlay.id === 'new-follower') {
                const data = isTesting === overlay.id && testData ? testData : overlay.previewData as PreviewData;
                return (
                    <div className="follower-container-preview">
                        <div className="follower-title">Novo Seguidor!</div>
                        <div className="follower-profile">
                            <img src={data.profilePicture} alt={data.name} />
                        </div>
                        <div className="follower-name">{data.name}</div>
                        <div className="follower-message">Obrigado por me seguir!</div>
                        <div className="follower-emblems">
                            <div className="emblem">⭐</div>
                            <div className="emblem">🎉</div>
                            <div className="emblem">❤️</div>
                        </div>
                    </div>
                );
            }

            if (overlay.id === 'gift-list') {
                const data = isTesting === overlay.id && testData ? testData : overlay.previewData as GiftPreviewData[];
                return (
                    <div className="gift-list-preview">
                        {Array.isArray(data) && data.map((item, index) => (
                            <div key={index} className={`gift-list-item ${item.isNew ? 'new-gift' : ''}`}>
                                <div className="gift-list-avatar">
                                    <img src={item.userProfile} alt={item.user} />
                                </div>
                                <div className="gift-list-username">{item.user}</div>
                                <div className="gift-list-message">
                                    {item.giftName}
                                    <div className="gift-list-giftimg">
                                        {item.giftImage ? (
                                            <img src={item.giftImage} alt={item.giftName} className="gift-image" />
                                        ) : (
                                            item.giftEmoji
                                        )}
                                    </div>
                                    {item.multiplier && <span className="multiplier">{item.multiplier}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            const data = isTesting === overlay.id && testData ? testData : overlay.previewData as PreviewData[];
            return (
                <div className="list-preview">
                    <div className="title">
                        {overlay.id === 'top-donors' ? 'Top Donors' : 'Top Likes'}
                    </div>
                    {Array.isArray(data) && data.map((item, index) => (
                        <div key={index} className={`item ${index < 3 ? (index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze') : 'normal'}`}>
                            <div className="rank">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                            </div>
                            <div className="profile-picture">
                                <img src={item.profilePicture} alt={item.name} />
                            </div>
                            <div className="name">{item.name}</div>
                            <div className="value">
                                {item.value} {overlay.id === 'top-likes' ? '❤️' : '💰'}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } catch (error) {
            console.error('Error rendering preview:', error);
            return <div className="text-red-500">Error loading preview</div>;
        }
    };

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
                            <Card key={overlay.id} className={`bg-[#2A2D36] border-[#3A3D46] p-6 transition-all duration-300 ${isTesting === overlay.id ? 'border-[#FFD110] shadow-[0_0_15px_rgba(255,209,16,0.3)]' : ''}`}>
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
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleCopyUrl(overlay.id)}
                                                    className="bg-[#FFD110] hover:bg-[#FFD110]/90 text-black"
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    {t('overlays.copyUrl')}
                                                </Button>
                                                {isTesting === overlay.id ? (
                                                    <Button
                                                        onClick={handleStopTest}
                                                        className="bg-red-500 hover:bg-red-600 text-white"
                                                    >
                                                        <Square className="w-4 h-4 mr-2" />
                                                        Parar Teste
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        onClick={() => handleTest(overlay.id)}
                                                        className="bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white"
                                                    >
                                                        <Play className="w-4 h-4 mr-2" />
                                                        {t('overlays.test')}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Section */}
                                    <div className="mt-4 border-t border-[#3A3D46] pt-4">
                                        {renderPreviewContent(overlay)}
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
                                        <div className="gift-list-preview">
                                            {(overlays[3].previewData as GiftPreviewData[]).map((item, index) => (
                                                <div key={index} className={`gift-list-item ${item.isNew ? 'new-gift' : ''}`}>
                                                    <div className="gift-list-avatar">
                                                        <img src={item.userProfile} alt={item.user} />
                                                    </div>
                                                    <div className="gift-list-username">{item.user}</div>
                                                    <div className="gift-list-message">
                                                        {item.giftName}
                                                        <div className="gift-list-giftimg">
                                                            {item.giftImage ? (
                                                                <img src={item.giftImage} alt={item.giftName} className="gift-image" />
                                                            ) : (
                                                                item.giftEmoji
                                                            )}
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
                                                <div key={index} className={`item ${index < 3 ? (index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze') : 'normal'}`}>
                                                    <div className="rank">
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                                                    </div>
                                                    <div className="profile-picture">
                                                        <img src={item.profilePicture} alt={item.name} />
                                                    </div>
                                                    <div className="name">{item.name}</div>
                                                    <div className="value">
                                                        {item.value} {showPreview === 'top-likes' ? '❤️' : '💰'}
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
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    position: relative;
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
                .list-preview .item.normal {
                    border: 1px solid #3A3D46;
                    background: rgba(255, 255, 255, 0.03);
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
                    padding: 12px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                    margin-bottom: 8px;
                    animation: slideDown 4s ease-in-out forwards;
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
                    gap: 8px;
                }
                .gift-list-giftimg {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                .gift-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .multiplier {
                    color: #FFD110;
                    font-weight: bold;
                    font-size: 12px;
                    background: rgba(255, 209, 16, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                @keyframes pulse {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                .animate-pulse {
                    animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                .gift-list-item, .item {
                    transition: all 0.3s ease;
                }

                .gift-list-item:hover, .item:hover {
                    transform: translateX(5px);
                    background: rgba(255, 255, 255, 0.1);
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .gift-list-item, .item {
                    animation: slideIn 0.3s ease-out;
                }

                .profile-picture img, .gift-list-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .follower-profile img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                @keyframes slideInFromRight {
                    0% {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    50% {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes slideDown {
                    0% {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    10% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    90% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                }

                .gift-list-item {
                    animation: slideInFromRight 0.6s ease-out;
                }

                .gift-list-item:nth-child(1) { animation-delay: 0s; }
                .gift-list-item:nth-child(2) { animation-delay: 0.2s; }
                .gift-list-item:nth-child(3) { animation-delay: 0.4s; }
                .gift-list-item:nth-child(4) { animation-delay: 0.6s; }
                .gift-list-item:nth-child(5) { animation-delay: 0.8s; }

                /* Animação para novos presentes chegando */
                @keyframes newGiftArrival {
                    0% {
                        transform: translateX(100%) scale(0.8);
                        opacity: 0;
                    }
                    20% {
                        transform: translateX(0) scale(1.1);
                        opacity: 1;
                    }
                    40% {
                        transform: translateX(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(0) scale(1);
                        opacity: 1;
                    }
                }

                .gift-list-item.new-gift {
                    animation: newGiftArrival 0.8s ease-out;
                    border: 2px solid #FFD110;
                    box-shadow: 0 0 15px rgba(255, 209, 16, 0.5);
                }

                /* Efeito de brilho para novos presentes */
                @keyframes glow {
                    0%, 100% {
                        box-shadow: 0 0 15px rgba(255, 209, 16, 0.5);
                    }
                    50% {
                        box-shadow: 0 0 25px rgba(255, 209, 16, 0.8);
                    }
                }

                .gift-list-item.new-gift {
                    animation: newGiftArrival 0.8s ease-out, glow 2s ease-in-out infinite;
                }

                /* Efeito de notificação para novos presentes */
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }

                .gift-list-item.new-gift::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: -10px;
                    width: 8px;
                    height: 8px;
                    background: #FFD110;
                    border-radius: 50%;
                    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
                }

                /* Animação de entrada mais suave para novos presentes */
                @keyframes bounceIn {
                    0% {
                        transform: translateX(100%) scale(0.3);
                        opacity: 0;
                    }
                    50% {
                        transform: translateX(0) scale(1.05);
                        opacity: 1;
                    }
                    70% {
                        transform: translateX(0) scale(0.9);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(0) scale(1);
                        opacity: 1;
                    }
                }

                .gift-list-item.new-gift {
                    animation: bounceIn 0.8s ease-out, glow 2s ease-in-out infinite;
                    position: relative;
                }
            `}</style>
        </Layout>
    );
};

export default Overlays; 