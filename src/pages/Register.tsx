import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import Logo from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react"; // Import icons

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    account: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.name || !formData.account || !formData.password) {
      setError("Todos os campos são obrigatórios");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    
    if (!formData.account.startsWith('@')) {
      setFormData(prev => ({...prev, account: `@${prev.account}`}));
    }

    setLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = formData;
      
      const response = await apiRequest('/users/register', {
        method: 'POST',
        body: registerData,
        isAuthenticated: false,
      });

      if (response && response.token) {
        authService.setToken(response.token);
        toast({
          title: "Registro realizado com sucesso!",
          description: "Bem-vindo ao LIVHE!",
        });
        navigate('/home');
      } else {
        toast({
          title: "Conta criada com sucesso",
          description: "Você será redirecionado para a página de login",
        });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      setError(error instanceof Error ? error.message : "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1C24] flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-center mb-8">
        <Logo size="xlarge" linkTo="/" />
      </div>
      
      <div className="w-full max-w-md bg-[#222429] rounded-lg shadow-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Criar Conta</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Nome Completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={handleChange}
              className="bg-[#2A2D36] border-[#3A3D46] text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              className="bg-[#2A2D36] border-[#3A3D46] text-white"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="account" className="text-white">Nome de usuário</Label>
            <Input
              id="account"
              name="account"
              type="text"
              placeholder="@seunome"
              value={formData.account}
              onChange={handleChange}
              className="bg-[#2A2D36] border-[#3A3D46] text-white"
              required
            />
            <p className="text-gray-400 text-sm mt-1">
              Seu nome de usuário deve começar com @
            </p>
          </div>
          
          <div>
            <Label htmlFor="password" className="text-white">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={formData.password}
                onChange={handleChange}
                className="bg-[#2A2D36] border-[#3A3D46] text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-[#2A2D36] border-[#3A3D46] text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-[#FFD110] hover:bg-[#E6C00F] text-black font-bold mt-6"
            disabled={loading}
          >
            {loading ? "Processando..." : "Criar Conta"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-[#FFD110] hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
