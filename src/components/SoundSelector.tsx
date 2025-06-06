import { useState, useEffect, useRef } from "react";
import { fetchSounds, searchSounds } from "@/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Music, Search, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Sound {
  title: string;
  url: string;
  directUrl: string;
}

interface SoundSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSound: (soundInfo: { title: string; directUrl: string }) => void;
}

export function SoundSelector({ open, onOpenChange, onSelectSound }: SoundSelectorProps) {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t } = useTranslation();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch sounds when component mounts
  useEffect(() => {
    const getSounds = async () => {
      setLoading(true);
      try {
        const data = await fetchSounds();
        setSounds(data);
      } catch (error) {
        console.error(t('soundSelector.error'), error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      getSounds();
    }
  }, [open, t]);

  // Handle search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim()) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchSounds(searchTerm);
          setSounds(results);
        } catch (error) {
          console.error(t('soundSelector.error'), error);
        } finally {
          setIsSearching(false);
        }
      }, 500); // Debounce de 500ms
    } else if (searchTerm === "") {
      // Se o campo de busca estiver vazio, carrega os sons top novamente
      const getSounds = async () => {
        setLoading(true);
        try {
          const data = await fetchSounds();
          setSounds(data);
        } catch (error) {
          console.error(t('soundSelector.error'), error);
        } finally {
          setLoading(false);
        }
      };
      getSounds();
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, t]);

  // Handle audio playback
  const togglePlay = (sound: Sound) => {
    if (playingSound === sound.directUrl) {
      audioRef.current?.pause();
      setPlayingSound(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Create new audio
      audioRef.current = new Audio(sound.directUrl);
      audioRef.current.play();
      setPlayingSound(sound.directUrl);
      
      // Reset playing state when audio ends
      audioRef.current.onended = () => {
        setPlayingSound(null);
      };
    }
  };

  // Stop audio when modal closes
  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause();
      setPlayingSound(null);
    }
    
    // Cleanup on component unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [open]);

  const handleSelectSound = (sound: Sound) => {
    onSelectSound({
      title: sound.title,
      directUrl: sound.directUrl
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#222429] text-white border-none max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white mb-4">
            {t('soundSelector.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 relative">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('soundSelector.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#2A2D36] text-white border-none pl-10"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#2A2D36] text-white border-none max-w-[280px]">
                  <p className="mb-2 text-sm leading-relaxed">
                    {t('soundSelector.myinstantsInfo', 'Você pode fazer upload de seus próprios sons no MyInstants e encontrá-los aqui pesquisando pelo nome!')}
                  </p>
                  <a 
                    href="https://www.myinstants.com/en/index/us/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFD110] hover:underline text-sm block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t('soundSelector.uploadToMyInstants', 'Clique aqui para fazer upload no MyInstants')}
                  </a>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {loading || isSearching ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFD110]"></div>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-2 p-1">
              {sounds.length > 0 ? (
                sounds.map((sound, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-[#2A2D36] rounded-md cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full w-8 h-8 hover:bg-[#FFD110] hover:text-black transition-colors border-[#FFD110]"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePlay(sound);
                              }}
                            >
                              {playingSound === sound.directUrl ? 
                                <Pause size={18} className="text-[#000000]" /> : 
                                <Play size={18} className="text-[#000000]" />
                              }
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#2A2D36] text-white border-none">
                            <p>{playingSound === sound.directUrl ? t('soundSelector.pauseSound', 'Pausar som') : t('soundSelector.playSound', 'Tocar som')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="truncate max-w-md" title={sound.title}>
                        {sound.title}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSelectSound(sound)}
                      className="bg-[#FFD110] hover:bg-[#E6C00F] text-black"
                    >
                      {t('soundSelector.select')}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {searchTerm ? t('soundSelector.noSoundsFound') : t('soundSelector.noSoundsAvailable')}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
