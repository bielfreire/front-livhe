
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogOutIcon, UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logout realizado",
      description: "Você será redirecionado para a página inicial",
    });
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="min-h-screen bg-[#1A1C24]">
      <header className="bg-[#2A2D36] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-3 bg-[#FFD110] rounded-full mr-1"></div>
            <div className="h-5 w-5 bg-white rounded-full mr-1"></div>
            <div className="h-6 w-6 bg-[#FFD110] rounded-full"></div>
            <span className="text-xl font-bold ml-1">
              <span className="text-[#FFD110]">LIV</span>
              <span className="text-white">HE</span>
            </span>
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="ghost" 
            className="text-white hover:bg-[#3A3D46]"
          >
            <LogOutIcon className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[#2A2D36] rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center mb-6">
            <UserIcon className="h-12 w-12 text-[#FFD110] mr-4" />
            <div>
              <h2 className="text-2xl font-bold">Bem-vindo ao Dashboard</h2>
              <p className="text-gray-400">Aqui você encontrará todas as funcionalidades do sistema</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#3A3D46] p-6 rounded-lg shadow border border-[#4A4D56]">
                <h3 className="text-lg font-medium text-[#FFD110] mb-2">Módulo {i}</h3>
                <p className="text-gray-300 mb-4">Descrição do módulo e suas funcionalidades principais.</p>
                <Button 
                  className="w-full bg-[#FFD110] hover:bg-[#E6C00F] text-black"
                  onClick={() => toast({ 
                    title: `Módulo ${i}`, 
                    description: "Esta funcionalidade está em desenvolvimento" 
                  })}
                >
                  Acessar
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
