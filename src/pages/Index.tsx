import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1A1C24] p-4">
      <div className="absolute top-8 right-8">
        <LanguageSwitcher />
      </div>

      <div className="flex flex-col items-center mb-12">
        <Logo size="xlarge" />
      </div>

      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4 text-white">{t('index.welcome')}</h1>
        <p className="text-xl text-gray-300 mb-8">
          {t('index.description')}
        </p>

        <div className="mt-10">
          <Link to="/login">
            <Button className="w-full bg-[#FFD110] hover:bg-[#E6C00F] text-black font-bold">
              {t('common.login')}
            </Button>
          </Link>
        </div>

        <div className="mt-10">
          <Link to="/registro">
          <Button className="w-full bg-[#FFD110] hover:bg-[#E6C00F] text-black font-bold">
              {t('auth.createAccount')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
