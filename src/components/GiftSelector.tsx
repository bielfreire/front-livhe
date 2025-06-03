import React, { useState, useEffect } from "react";
import { fetchTikTokGifts } from "@/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Gift } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfile } from "@/hooks/use-profile";

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
  const [username, setUsername] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { t } = useTranslation();
  const { profile } = useProfile();

  useEffect(() => {
    if (profile?.account) {
      setUsername(profile.account);
    }
  }, [profile]);

  const loadGifts = async () => {
    if (!username) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchTikTokGifts(username);
      setGifts(data);
    } catch (err) {
      setError(t('giftSelector.error'));
      console.error("Error loading gifts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && username) {
      loadGifts();
    }
  }, [open, username]);

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
          <DialogTitle>{t('giftSelector.title')}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {t('giftSelector.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder={t('giftSelector.usernamePlaceholder')}
              className="bg-[#2A2D36] border-[#3A3D46] text-white"
            />
            <Button 
              onClick={loadGifts} 
              disabled={isLoading}
              className="bg-[#FFD110] hover:bg-[#E6C00F] text-black"
            >
              {t('giftSelector.search')}
            </Button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          <Input
            placeholder={t('giftSelector.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2A2D36] border-[#3A3D46] text-white"
          />

          <ScrollArea className="h-[50vh] rounded-md border border-[#3A3D46] p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <p>{t('giftSelector.loading')}</p>
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
                <p>{gifts.length === 0 ? t('giftSelector.noGiftsFound') : t('giftSelector.noGiftsMatch')}</p>
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
            {t('giftSelector.cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
