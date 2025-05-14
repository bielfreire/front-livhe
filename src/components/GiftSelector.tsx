
import React, { useState, useEffect } from "react";
import { fetchTikTokGifts } from "@/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gift } from "lucide-react";

interface GiftSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectGift: (giftInfo: { id: string, name: string, imageUrl: string }) => void;
}

interface TikTokGift {
  id: number;
  name: string;
  diamond_count: number;
  image_urls: string[];
}

export const GiftSelector = ({ open, onOpenChange, onSelectGift }: GiftSelectorProps) => {
  const [gifts, setGifts] = useState<TikTokGift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("@odarkzn1_0");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const loadGifts = async () => {
    if (!username) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchTikTokGifts(username);
      setGifts(data);
    } catch (err) {
      setError("Erro ao buscar gifts. Verifique o username e tente novamente.");
      console.error("Erro ao carregar gifts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadGifts();
    }
  }, [open]);

  const handleSelectGift = (gift: TikTokGift) => {
    onSelectGift({
      id: gift.id.toString(),
      name: gift.name,
      imageUrl: gift.image_urls[0] || ""
    });
    onOpenChange(false);
  };

  const filteredGifts = gifts.filter(gift => 
    gift.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#222429] border-[#2A2D36] text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selecionar Gift</DialogTitle>
          <DialogDescription className="text-gray-400">
            Escolha um gift do TikTok para associar ao seu preset
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username TikTok (ex: @odarkzn1_0)"
              className="bg-[#2A2D36] border-[#3A3D46] text-white"
            />
            <Button 
              onClick={loadGifts} 
              disabled={isLoading}
              className="bg-[#FFD110] hover:bg-[#E6C00F] text-black"
            >
              Buscar
            </Button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <Input
            placeholder="Filtrar gifts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2A2D36] border-[#3A3D46] text-white"
          />

          <ScrollArea className="h-[50vh] rounded-md border border-[#3A3D46] p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>Carregando gifts...</p>
              </div>
            ) : filteredGifts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredGifts.map((gift) => (
                  <div 
                    key={gift.id}
                    onClick={() => handleSelectGift(gift)}
                    className="bg-[#2A2D36] p-2 rounded-lg cursor-pointer hover:bg-[#3A3D46] transition-colors flex flex-col items-center"
                  >
                    <img 
                      src={gift.image_urls[0]} 
                      alt={gift.name} 
                      className="w-16 h-16 object-contain mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <p className="text-sm font-medium text-center">{gift.name}</p>
                    <p className="text-xs text-gray-400">{gift.diamond_count} 💎</p>
                    <p className="text-xs text-gray-500">ID: {gift.id}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                <Gift size={48} className="mb-2 opacity-50" />
                <p>{gifts.length === 0 ? "Nenhum gift encontrado. Busque por um username do TikTok." : "Nenhum gift corresponde à sua pesquisa."}</p>
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 text-white hover:bg-gray-600"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
