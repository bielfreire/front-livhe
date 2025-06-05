import React, { useEffect, useState } from 'react';

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
    if (window.electron?.on && window.electron?.removeAllListeners && window.electron?.invoke) {
      // Escuta eventos de atualização
      window.electron.on('update-status', (data: { status: string; info?: UpdateInfo }) => {
        setUpdateStatus(data.status);
        if (data.info) setUpdateInfo(data.info);
      });

      window.electron.on('update-progress', (data: UpdateProgress) => {
        setProgress(data);
      });

      // Verifica atualizações ao iniciar
      checkForUpdates();

      return () => {
        window.electron.removeAllListeners('update-status');
        window.electron.removeAllListeners('update-progress');
      };
    }
  }, []);

  const checkForUpdates = async () => {
    try {
      await window.electron.invoke('check-for-updates');
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  };

  const downloadUpdate = async () => {
    try {
      await window.electron.invoke('download-update');
    } catch (error) {
      console.error('Erro ao baixar atualização:', error);
    }
  };

  const installUpdate = async () => {
    try {
      await window.electron.invoke('install-update');
    } catch (error) {
      console.error('Erro ao instalar atualização:', error);
    }
  };

  // Bloqueia o app se a atualização foi baixada
  if (updateStatus === 'downloaded') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#fff',
      }}>
        <h2>Atualização baixada!</h2>
        <p>Uma nova versão do aplicativo foi baixada.<br />Clique em <b>Atualizar agora</b> para reiniciar e concluir a atualização.</p>
        <p>Versão: {updateInfo?.version}</p>
        <button
          onClick={installUpdate}
          style={{
            marginTop: 24,
            padding: '12px 32px',
            fontSize: 18,
            background: '#FFD110',
            color: '#222',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Atualizar agora
        </button>
      </div>
    );
  }

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