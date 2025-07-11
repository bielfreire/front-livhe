import { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GtaStatusCardProps {
  gtaStatus: any;
  gtaLoading: boolean;
  onInstallAll: () => void;
  onSelectFolder: () => void;
  onUninstallAll: () => void;
}

const GtaStatusCard = ({ gtaStatus, gtaLoading, onInstallAll, onSelectFolder, onUninstallAll }: GtaStatusCardProps) => {
  const [open, setOpen] = useState(false);

  const statusList = [
    {
      label: "GTA V",
      installed: gtaStatus?.gtaInstalled,
      path: gtaStatus?.gtaPath,
    },
    {
      label: "ChaosModV",
      installed: gtaStatus?.chaosModInstalled,
    },
    {
      label: "ScriptHookV",
      installed: gtaStatus?.scriptHookInstalled,
    },
    {
      label: "Pasta ChaosMod",
      installed: gtaStatus?.chaosmodFolderInstalled,
    },
  ];

  const allInstalled = statusList.every((item) => item.installed);

  return (
    <div className="rounded-xl bg-[#23272e] shadow-lg min-w-[320px]">
      <button
        className="w-full flex items-center justify-between px-4 py-3 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <FolderOpen className="text-yellow-400" size={20} />
          {allInstalled ? (
            <span role="img" aria-label="Tudo instalado corretamente">
              <CheckCircle className="text-green-400" size={20} />
            </span>
          ) : (
            <span role="img" aria-label="Faltam componentes">
              <XCircle className="text-red-400" size={20} />
            </span>
          )}
          <span className="text-lg font-bold text-white">Status do GTA V e Mods</span>
        </div>
        {open ? (
          <ChevronUp className="text-gray-400" />
        ) : (
          <ChevronDown className="text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4">
          {gtaLoading ? (
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
                    {item.label === 'GTA V' && item.path && (
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
                    onClick={onInstallAll}
                    className="bg-blue-500 text-white w-full"
                    size="lg"
                  >
                    Instalar dependências
                  </Button>
                )}
                {allInstalled && (
                  <Button
                    onClick={onUninstallAll}
                    className="bg-red-500 text-white w-full"
                    size="lg"
                  >
                    Desinstalar dependências
                  </Button>
                )}
                <Button
                  onClick={onSelectFolder}
                  className="bg-gray-700 text-white w-full mt-2"
                  size="sm"
                >
                  {gtaStatus?.gtaInstalled ? "Alterar pasta do GTA V" : "Selecionar pasta do GTA V"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GtaStatusCard; 