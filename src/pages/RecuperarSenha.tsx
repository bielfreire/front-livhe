import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/utils/api";
import Logo from "@/components/Logo";

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, insira seu e-mail",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      await apiRequest('/users/request-password-reset', {
        method: 'POST',
        body: { email },
        isAuthenticated: false
      });
      
      toast({
        title: "E-mail enviado",
        description: "Se o e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha",
      });
      
      setEmail("");
      navigate(`/resetar-senha?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("Erro ao solicitar recuperação de senha:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua solicitação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1C24] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <Logo size="xlarge" linkTo="/" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h1>
          <p className="text-gray-400">
            Digite seu e-mail cadastrado para receber as instruções de recuperação de senha
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[#FFD110] text-sm font-medium">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#2A2D36] border-[#3A3D46] text-white focus-visible:ring-[#FFD110]"
              disabled={loading}
              placeholder="seu@email.com"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white border border-[#FFD110]"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
            ) : (
              "Enviar instruções"
            )}
          </Button>

          <div className="text-center">
            <Link to="/login" className="text-white hover:text-[#FFD110]">
              Voltar para o login
            </Link>
          </div>
        </form>

        <div className="fixed bottom-8 right-8">
          <Logo size="medium" />
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;