
import { useState, useEffect, useRef } from "react";
import { fetchSounds } from "@/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Music } from "lucide-react";

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
  const [filteredSounds, setFilteredSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch sounds when component mounts
  useEffect(() => {
    const getSounds = async () => {
      setLoading(true);
      try {
        const data = await fetchSounds();
        setSounds(data);
        setFilteredSounds(data);
      } catch (error) {
        console.error("Erro ao buscar sons:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      getSounds();
    }
  }, [open]);

  // Filter sounds based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = sounds.filter((sound) =>
        sound.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSounds(filtered);
    } else {
      setFilteredSounds(sounds);
    }
  }, [searchTerm, sounds]);

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
          <DialogTitle className="text-xl font-bold text-white mb-4">Selecionar Som</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Input
            placeholder="Buscar som..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#2A2D36] text-white border-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFD110]"></div>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-2 p-1">
              {filteredSounds.length > 0 ? (
                filteredSounds.map((sound, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-[#2A2D36] rounded-md cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-8 h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay(sound);
                        }}
                      >
                        {playingSound === sound.directUrl ? <Pause size={16} /> : <Play size={16} />}
                      </Button>
                      <div className="truncate max-w-md" title={sound.title}>
                        {sound.title}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSelectSound(sound)}
                      className="bg-[#FFD110] hover:bg-[#E6C00F] text-black"
                    >
                      Selecionar
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Nenhum som encontrado
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
