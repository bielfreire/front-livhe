
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1C24] p-4">
      <div className="flex flex-col items-center mb-12">
        <Logo size="xlarge" />
      </div>

      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-white">Bem-vindo </h1>
        <p className="text-xl text-gray-300 mb-8">
          Uma plataforma inovadora que vai profissionalizar sua LIVHE!
        </p>

        <div className="mt-10">
          <Link to="/login">
            <Button className="w-full bg-[#FFD110] hover:bg-[#E6C00F] text-black font-bold">
              Entrar
            </Button>
          </Link>
        </div>

        <div className="mt-10">
          <Link to="/registro">
          <Button className="w-full bg-[#FFD110] hover:bg-[#E6C00F] text-black font-bold">
          Criar Conta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
