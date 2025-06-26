import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, RefreshCw, CheckCircle, AlertCircle, Clock, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from "@/components/Layout";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  getCurrentVersion, 
  getVersionHistory, 
  formatReleaseDate,
  type UpdateInfo,
  type UpdateProgress 
} from '@/config/updates';

const Updates: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [currentVersion] = useState(getCurrentVersion());
  const [versionHistory] = useState(getVersionHistory());

  useEffect(() => {
    if (window.electron?.on && window.electron?.removeAllListeners && window.electron?.invoke) {
      // Escuta eventos de atualização
      window.electron.on('update-status', (data: { status: string; info?: UpdateInfo }) => {
        setUpdateStatus(data.status);
        if (data.info) setUpdateInfo(data.info);
        setIsChecking(false);
      });

      window.electron.on('update-progress', (data: UpdateProgress) => {
        setProgress(data);
      });

      return () => {
        window.electron.removeAllListeners('update-status');
        window.electron.removeAllListeners('update-progress');
      };
    }
  }, []);

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      await window.electron.invoke('check-for-updates');
      toast({
        title: t('updates.checking'),
        description: t('updates.checkingDescription'),
      });
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      toast({
        title: t('updates.error'),
        description: t('updates.checkError'),
        variant: 'destructive',
      });
      setIsChecking(false);
    }
  };

  const downloadUpdate = async () => {
    try {
      await window.electron.invoke('download-update');
      toast({
        title: t('updates.downloading'),
        description: t('updates.downloadStarted'),
      });
    } catch (error) {
      console.error('Erro ao baixar atualização:', error);
      toast({
        title: t('updates.error'),
        description: t('updates.downloadError'),
        variant: 'destructive',
      });
    }
  };

  const installUpdate = async () => {
    try {
      await window.electron.invoke('install-update');
    } catch (error) {
      console.error('Erro ao instalar atualização:', error);
      toast({
        title: t('updates.error'),
        description: t('updates.installError'),
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <Download className="w-5 h-5 text-blue-500" />;
      case 'downloaded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return t('updates.available');
      case 'downloaded':
        return t('updates.downloaded');
      case 'error':
        return t('updates.error');
      case 'not-available':
        return t('updates.upToDate');
      default:
        return t('updates.checkForUpdates');
    }
  };

  return (
    <Layout>
      
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('updates.title')}</h1>
          <p className="text-gray-400 mt-2">{t('updates.description')}</p>
        </div>
        {/* <Button
          onClick={checkForUpdates}
          disabled={isChecking}
          className="bg-[#FFD110] text-black hover:bg-[#FFD110]/90"
        >
          {isChecking ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          {isChecking ? t('updates.checking') : t('updates.checkForUpdates')}
        </Button> */}
      </div>

      {/* Current Version */}
      <Card className="bg-[#2A2D36] border-[#3A3D46]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Info className="w-5 h-5" />
            {t('updates.currentVersion')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">v{currentVersion}</p>
              <p className="text-gray-400">{t('updates.latestVersion')}</p>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              {t('updates.upToDate')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Update Status */}
      {updateStatus && updateStatus !== 'not-available' && (
        <Card className="bg-[#2A2D36] border-[#3A3D46]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {getStatusIcon(updateStatus)}
              {getStatusText(updateStatus)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {updateInfo && (
              <div>
                <p className="text-white font-medium">
                  {t('updates.newVersion')}: v{updateInfo.version}
                </p>
                {updateInfo.releaseDate && (
                  <p className="text-gray-400 text-sm">
                    {t('updates.releaseDate')}: {formatReleaseDate(updateInfo.releaseDate, i18n.language)}
                  </p>
                )}
              </div>
            )}

            {progress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t('updates.downloading')}</span>
                  <span className="text-white">{Math.round(progress.percent)}%</span>
                </div>
                <Progress value={progress.percent} className="h-2" />
                <p className="text-xs text-gray-500">
                  {Math.round(progress.transferred / 1024 / 1024)}MB / {Math.round(progress.total / 1024 / 1024)}MB
                </p>
              </div>
            )}

            {updateStatus === 'available' && (
              <Button onClick={downloadUpdate} className="bg-[#FFD110] text-black hover:bg-[#FFD110]/90">
                <Download className="w-4 h-4 mr-2" />
                {t('updates.downloadUpdate')}
              </Button>
            )}

            {updateStatus === 'downloaded' && (
              <Button onClick={installUpdate} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                {t('updates.installUpdate')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Version History */}
      <Card className="bg-[#2A2D36] border-[#3A3D46]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('updates.versionHistory')}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {t('updates.versionHistoryDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versionHistory.map((version, index) => (
              <div
                key={version.version}
                className={`p-4 rounded-lg border ${
                  version.isCurrent
                    ? 'bg-[#FFD110]/10 border-[#FFD110]'
                    : 'bg-[#1A1C24] border-[#3A3D46]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      v{version.version}
                    </h3>
                    {version.isCurrent && (
                      <Badge className="bg-[#FFD110] text-black">
                        {t('updates.current')}
                      </Badge>
                    )}
                    {version.isMajor && (
                      <Badge className="bg-purple-500 text-white flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Major
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatReleaseDate(version.releaseDate, i18n.language)}
                  </span>
                </div>
                <div className="text-gray-300 whitespace-pre-line">
                  {version.releaseNotes}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </Layout>
  );
};

export default Updates; 