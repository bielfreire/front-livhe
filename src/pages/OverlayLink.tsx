import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";
import { useTranslation } from "react-i18next";
import Breadcrumb from "@/components/Breadcrumb";

const OverlayLink = () => {
    const { moodId, gameId } = useParams();
    const { toast } = useToast();
    const { profile } = useProfile();
    const [overlayUrl, setOverlayUrl] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        if (!profile) return;
        
        // Sempre usa a porta 4000 para o overlay, pois é onde o backend está rodando
        const host = process.env.NODE_ENV === "production" ? "localhost" : window.location.hostname;
        const baseUrl = `http://${host}:4000`;
        const overlayPath = `/presets/overlay/${gameId}/${moodId}?userId=${profile.id}`;
        setOverlayUrl(`${baseUrl}${overlayPath}`);
    }, [moodId, gameId, profile]);

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(overlayUrl);
        toast({
            title: t('overlayLink.urlCopied'),
            description: t('overlayLink.urlCopiedDescription'),
        });
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
            <Breadcrumb
                items={[
                    { label: t('common.home'), path: "/home" },
                    { label: t('navigation.games'), path: "/games" },
                    { label: t('moods.title'), path: `/moods/${gameId}` },
                    { label: t('overlayLink.title'), path: `/moods/${gameId}/mood/${moodId}/overlay` },
                ]}
            />
            <div className="min-h-screen bg-[#1A1C24] p-6">
                <h2 className="text-white text-2xl font-bold mb-6">{t('overlayLink.title')}</h2>
                
                <Card className="bg-[#222429] border-none p-6">
                    <h3 className="text-white text-lg mb-4">{t('overlayLink.urlTitle')}</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        {t('overlayLink.urlDescription')}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                        <Input
                            value={overlayUrl}
                            readOnly
                            className="bg-[#2A2D36] text-white border-none flex-1"
                        />
                        <Button
                            onClick={handleCopyUrl}
                            className="bg-[#FFD110] hover:bg-[#E6C00F] text-black"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            {t('overlayLink.copy')}
                        </Button>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-white text-md mb-2">{t('overlayLink.howToUse')}</h4>
                        <ol className="text-gray-400 text-sm space-y-2">
                            <li>{t('overlayLink.steps.1')}</li>
                            <li>{t('overlayLink.steps.2')}</li>
                            <li>{t('overlayLink.steps.3')}</li>
                            <li>{t('overlayLink.steps.4')}</li>
                            <li>{t('overlayLink.steps.5')}</li>
                        </ol>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default OverlayLink;