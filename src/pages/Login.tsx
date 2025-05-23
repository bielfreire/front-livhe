import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockIcon, LogInIcon, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { apiRequest } from "@/utils/api";
import Logo from "@/components/Logo";

interface LocationState {
  from?: {
    pathname: string;
  };
}

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!usuario || !senha) {
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: {
          email: usuario,
          password: senha
        },
        isAuthenticated: false // Não precisa de autenticação para login
      });
      
      // Salva o token no localStorage
      authService.setToken(response.access_token);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Você está sendo redirecionado",
      });
      
      // Redireciona para a página que o usuário tentou acessar ou para /home
      const state = location.state as LocationState;
      const destination = state?.from?.pathname || '/home';
      
      setTimeout(() => navigate(destination), 1000);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      const errorMessage = error.message || (error.status === 401 ? "Credenciais inválidas" : "Servidor indisponível");
      toast({
        title: "Erro no login",
        description: errorMessage,
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="usuario" className="block text-[#FFD110] text-sm font-medium">
              Usuário
            </label>
            <Input
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="bg-[#2A2D36] border-[#3A3D46] text-white focus-visible:ring-[#FFD110]"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="senha" className="block text-[#FFD110] text-sm font-medium">
              Senha
            </label>
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="bg-[#2A2D36] border-[#3A3D46] text-white focus-visible:ring-[#FFD110]"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="text-right">
              <Link to="/recuperar-senha" className="text-xs text-white hover:text-[#FFD110]">
                Esqueceu sua senha? <span className="underline">clique aqui</span>
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white border border-[#FFD110]"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Entrando...
              </span>
            ) : (
              <>
                <LogInIcon className="mr-2 h-4 w-4" />
                Entrar
              </>
            )}
          </Button>

          <div className="flex items-center justify-center space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="bg-[#2A2D36] text-white border-[#3A3D46] hover:bg-[#3A3D46] px-4"
              onClick={() => toast({ title: "Google Login", description: "Funcionalidade em desenvolvimento" })}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="16" width="15.25" viewBox="0 0 488 512" className="mr-2">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline" 
              className="bg-[#2A2D36] text-white border-[#3A3D46] hover:bg-[#3A3D46] px-4"
              onClick={() => toast({ title: "TikTok Login", description: "Funcionalidade em desenvolvimento" })}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512" className="mr-2">
                <path fill="currentColor" d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
              </svg>
              TikTok
            </Button>
          </div>

          <div className="text-center pt-2">
            <Link to="/registro" className="text-white hover:text-[#FFD110]">
              Registre-se <span className="underline">aqui</span>!
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

export default Login;
