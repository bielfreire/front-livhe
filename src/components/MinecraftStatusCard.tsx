import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface MinecraftStatusCardProps {
  minecraftStatus: any;
  minecraftLoading: boolean;
  onInstallServer: () => void;
  onSelectFolder: () => void;
  onUninstallAll: () => void;
}

const MinecraftStatusCard = ({ 
  minecraftStatus, 
  minecraftLoading, 
  onInstallServer, 
  onSelectFolder, 
  onUninstallAll 
}: MinecraftStatusCardProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const statusList = [
    {
      label: "Pasta do Servidor",
      installed: minecraftStatus?.minecraftPathExists,
      path: minecraftStatus?.minecraftPath,
    },
    {
      label: "Server.jar",
      installed: minecraftStatus?.serverJarExists,
    },
    {
      label: "EULA",
      installed: minecraftStatus?.eulaExists,
    },
    {
      label: "Server Properties",
      installed: minecraftStatus?.serverPropertiesExists,
    },
  ];

  const allInstalled = statusList.every((item) => item.installed);

  // Determina a cor da borda baseada no status
  const getBorderColor = () => {
    if (minecraftLoading) return "border-gray-600"; // Cinza durante carregamento
    return allInstalled ? "border-green-500" : "border-red-500"; // Verde se tudo instalado, vermelho se faltando
  };

  return (
    <div className={`rounded-xl bg-[#23272e] shadow-lg min-w-[320px] border-2 ${getBorderColor()}`}>
      <button
        className="w-full flex items-center justify-between px-4 py-3 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="text-green-400" size={20} />
          {allInstalled ? (
            <span role="img" aria-label="Tudo instalado corretamente">
              <CheckCircle className="text-green-400" size={20} />
            </span>
          ) : (
            <span role="img" aria-label="Faltam componentes">
              <XCircle className="text-red-400" size={20} />
            </span>
          )}
          <span className="text-lg font-bold text-white">Status do Servidor Minecraft</span>
        </div>
        {open ? (
          <ChevronUp className="text-gray-400" />
        ) : (
          <ChevronDown className="text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          {minecraftLoading ? (
            <div className="text-gray-400 py-4">Verificando status...</div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              {statusList.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between bg-[#292d36] rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {item.installed ? (
                      <CheckCircle className="text-green-400" size={18} />
                    ) : (
                      <XCircle className="text-red-400" size={18} />
                    )}
                    <span className="text-white font-medium">{item.label}</span>
                    {item.label === 'Pasta do Servidor' && item.path && (
                      <span
                        className="text-xs text-gray-400 ml-2 max-w-[180px] truncate block cursor-pointer"
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={item.path}
                      >
                        {item.path}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div className="mt-4 flex flex-col items-center">
                {!allInstalled && (
                  <Button
                    onClick={onInstallServer}
                    className="bg-green-500 text-white w-full"
                    size="lg"
                  >
                    {t('moods.installMinecraftServer')}
                  </Button>
                )}
                {allInstalled && (
                  <Button
                    onClick={onUninstallAll}
                    className="bg-red-500 text-white w-full"
                    size="lg"
                  >
                    {t('moods.uninstallMinecraftServer')}
                  </Button>
                )}
                <Button
                  onClick={onSelectFolder}
                  className="bg-gray-700 text-white w-full mt-2"
                  size="sm"
                >
                  {minecraftStatus?.minecraftPathExists ? t('moods.changeMinecraftFolder') : t('moods.selectMinecraftFolder')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MinecraftStatusCard; 