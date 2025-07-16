import { useTranslation } from 'react-i18next';
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoId: string;
}

const tutorials: Tutorial[] = [
  {
    id: '6',
    title: 'LIVE INTERATIVA NO TIKTOK COM GTA - GANHE DINHEIRO JOGANDO',
    description: 'Tutorial de como fazer uma live interativa no tiktok com gta e ganhar dinheiro jogando.',
    videoId: 'EyGUWMYAu9Q'
  },
  {
    id: '3',
    title: 'COMO CONFIGURAR VIDEO NO LIVHE APP',
    description: 'Tutorial básico de como utilizar nossa plataforma',
    videoId: 'LcEgNJyC3WM'
  },
  {
    id: '1',
    title: 'COMO LINKAR LIVHE APP COM TIKTOK LIVE STUDIO',
    description: 'Tutorial básico de como utilizar nossa plataforma',
    videoId: '5wJzmtcty6c'
  },
  {
    id: '2',
    title: 'COMO CONFIGURAR JOGO NO APP LIVHE',
    description: 'Tutorial básico de como utilizar nossa plataforma',
    videoId: 'mTwVvqo64bs'
  },
  {
    id: '4',
    title: "COMO COLOCAR OVERLAYS NO LIVHE",
    description: "Dicas configurar ovelays.",
    videoId: "BxgbGI1B6ZI"
  },
  {
    id: '5',
    title: "TUTORIAL COMPLETO DE COMO USAR O LIVHE E PROFISSIONALIZAR SUA LIVE NO TIKTOK",
    description: "aprenda a usar o livhe e profissionalizar sua live no tiktok.",
    videoId: "I8YCTHdbTa4"
  },
 
  // Add more tutorials here as needed
];

const Tutorials = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <Breadcrumb
                items={[
                    { label: t('common.home'), path: "/home" },
                    { label: t('navigation.tutorials'), path: "/tutorials" },
                ]}
            />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">{t('tutorials.title', 'Tutoriais')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="bg-[#2A2D36] rounded-lg overflow-hidden">
              <div className="aspect-video">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${tutorial.videoId}`}
                  title={tutorial.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-white mb-2">{tutorial.title}</h3>
                <p className="text-gray-400">{tutorial.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Tutorials; 