import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

interface UpdateInfo {
  version: string;
  releaseDate: string;
}

interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
}

export const UpdateNotification: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);

  useEffect(() => {
    // Escuta eventos de atualização
    ipcRenderer.on('update-status', (_, status: string, info?: UpdateInfo) => {
      setUpdateStatus(status);
      if (info) setUpdateInfo(info);
    });

    ipcRenderer.on('update-progress', (_, progress: UpdateProgress) => {
      setProgress(progress);
    });

    // Verifica atualizações ao iniciar
    checkForUpdates();

    return () => {
      ipcRenderer.removeAllListeners('update-status');
      ipcRenderer.removeAllListeners('update-progress');
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      await ipcRenderer.invoke('check-for-updates');
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  };

  const downloadUpdate = async () => {
    try {
      await ipcRenderer.invoke('download-update');
    } catch (error) {
      console.error('Erro ao baixar atualização:', error);
    }
  };

  const installUpdate = async () => {
    try {
      await ipcRenderer.invoke('install-update');
    } catch (error) {
      console.error('Erro ao instalar atualização:', error);
    }
  };

  if (updateStatus === 'not-available') return null;

  return (
    <div className="update-notification">
      {updateStatus === 'available' && (
        <div>
          <h3>Nova atualização disponível!</h3>
          <p>Versão {updateInfo?.version}</p>
          <button onClick={downloadUpdate}>Baixar atualização</button>
        </div>
      )}

      {updateStatus === 'downloaded' && (
        <div>
          <h3>Atualização baixada!</h3>
          <p>Versão {updateInfo?.version}</p>
          <button onClick={installUpdate}>Instalar agora</button>
        </div>
      )}

      {progress && (
        <div>
          <p>Baixando: {Math.round(progress.percent)}%</p>
          <progress value={progress.percent} max="100" />
        </div>
      )}

      {updateStatus === 'error' && (
        <div>
          <h3>Erro ao verificar atualizações</h3>
          <button onClick={checkForUpdates}>Tentar novamente</button>
        </div>
      )}
    </div>
  );
}; 