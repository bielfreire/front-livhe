import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/utils/api";
import Logo from "@/components/Logo";
import { useTranslation } from "react-i18next";

const ResetarSenha = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !resetCode || !newPassword) {
      toast({
        title: t('auth.loginError'),
        description: t('auth.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/users/reset-password", {
        method: "POST",
        body: { email, resetCode, newPassword },
        isAuthenticated: false,
      });

      toast({
        title: t('auth.resetPasswordSuccess'),
        description: t('auth.redirecting'),
      });

      navigate("/login");
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast({
        title: t('auth.loginError'),
        description: t('auth.resetPasswordError'),
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
          <h1 className="text-2xl font-bold text-white mb-2">{t('auth.resetPasswordTitle')}</h1>
          <p className="text-gray-400">
            {t('auth.resetPasswordDescription')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-[#FFD110] text-sm font-medium">
              {t('auth.email')}
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

          <div className="space-y-2">
            <label htmlFor="resetCode" className="block text-[#FFD110] text-sm font-medium">
              {t('auth.resetCode')}
            </label>
            <Input
              id="resetCode"
              type="text"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              className="bg-[#2A2D36] border-[#3A3D46] text-white focus-visible:ring-[#FFD110]"
              disabled={loading}
              placeholder={t('auth.resetCode')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-[#FFD110] text-sm font-medium">
              {t('auth.newPassword')}
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-[#2A2D36] border-[#3A3D46] text-white focus-visible:ring-[#FFD110]"
              disabled={loading}
              placeholder={t('auth.newPassword')}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#3A3D46] hover:bg-[#4A4D56] text-white border border-[#FFD110]"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('auth.resetting')}
              </span>
            ) : (
              t('auth.resetPassword')
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetarSenha;