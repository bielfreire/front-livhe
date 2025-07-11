import React, { useEffect, useState } from 'react';
import { Progress } from './ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import image from '@/assets/images/image.png';


interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Iniciando aplicação...');

  useEffect(() => {
    let progressComplete = false;
    let backendReady = false;

    // Função para verificar se pode completar
    const checkComplete = () => {
      if (progressComplete && backendReady) {
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    };

    // Escuta os eventos de progresso do electron
    window.electron.on('installation-progress', (data: { message: string; progress: number }) => {
      setMessage(data.message);
      setProgress(data.progress);

      if (data.progress === 100) {
        progressComplete = true;
        setMessage('Aguardando inicialização do servidor...');
        checkComplete();
      }
    });

    // Escuta o evento de backend pronto
    window.electron.on('backend-ready', () => {
      backendReady = true;
      setMessage('Aplicação pronta!');
      checkComplete();
    });
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm flex items-center justify-center">
      <Card className="w-[400px] border-primary/20 shadow-lg bg-background/75">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img
              src={image}
              alt="Logo"
              className="w-32 h-32 object-contain"
            />
          </div>
          <CardTitle className="text-center text-2xl font-bold text-primary">
            Instalando Aplicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-10 h-10 border-4 border-primary/20 border-l-primary rounded-full animate-spin"></div>
            </div>
            <p className="text-sm text-muted-foreground text-center">{message}</p>
            <Progress
              value={progress}
              className={cn(
                "w-full h-2",
                "bg-primary/20",
                "[&>div]:bg-primary"
              )}
            />
            <p className="text-xs text-muted-foreground text-center">
              {progress}% concluído
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 