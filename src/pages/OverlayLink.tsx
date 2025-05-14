import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profile";

const OverlayLink = () => {
    const { moodId, gameId } = useParams();
    const { toast } = useToast();
    const { profile } = useProfile();
    const [overlayUrl, setOverlayUrl] = useState("");

    useEffect(() => {
        if (!profile) return;
        
        // Sempre usa a porta 4000 para o overlay, pois é onde o backend está rodando
        const host = process.env.NODE_ENV === "production" ? "localhost" : window.location.hostname; // Força localhost no ambiente de produção
        const baseUrl = `http://${host}:4000`; // Força a porta 4000
        const overlayPath = `/presets/overlay/${gameId}/${moodId}?userId=${profile.id}`;
        setOverlayUrl(`${baseUrl}${overlayPath}`);
    }, [moodId, gameId, profile]);

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(overlayUrl);
        toast({
            title: "URL copiada!",
            description: "O link do overlay foi copiado para sua área de transferência.",
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
            <div className="min-h-screen bg-[#1A1C24] p-6">
                <h2 className="text-white text-2xl font-bold mb-6">Link do Overlay</h2>
                
                <Card className="bg-[#222429] border-none p-6">
                    <h3 className="text-white text-lg mb-4">URL do seu overlay</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Use este link no OBS Studio ou outro software de streaming como uma fonte de navegador.
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
                            Copiar
                        </Button>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-white text-md mb-2">Como usar:</h4>
                        <ol className="text-gray-400 text-sm space-y-2">
                            <li>1. Copie o link acima</li>
                            <li>2. No OBS Studio, adicione uma nova fonte do tipo "Navegador"</li>
                            <li>3. Cole o link no campo URL</li>
                            <li>4. Defina a largura e altura de acordo com sua resolução</li>
                            <li>5. Marque a opção "Atualizar navegador quando a cena fica ativa"</li>
                        </ol>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default OverlayLink;