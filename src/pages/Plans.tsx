import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { apiRequest } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

interface Plan {
    id: string;
    name: string;
    price: string;
    features: string[];
    recommended?: boolean;
}

const Plans = () => {
    const navigate = useNavigate();
    const { profile, isLoading } = useProfile();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const plans: Plan[] = [
        {
            id: "free",
            name: "Free",
            price: "Grátis",
            features: [
                "Até 5 presets",
                "Acesso básico aos gifts",
                "Acesso básico aos sons",
                "Acesso básico aos comandos",
                "Suporte por email"
            ]
        },
        {
            id: "pro",
            name: "Pro",
            price: "R$ 19,90/mês",
            features: [
                "Presets ilimitados",
                "Acesso a todos os gifts",
                "Acesso a todos os sons",
                "Acesso a todos os comandos",
                "Suporte prioritário",
                "Personalização avançada",
                "Integração com mais jogos",
                "Backup automático"
            ],
            recommended: true
        }
    ];

    const handleUpgrade = async (planId: string) => {
        if (planId === "free") return;
        
        // Redireciona para a página de pagamento
        navigate("/payment");
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FFD110]"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-[#1A1C24] p-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8">Planos Disponíveis</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plans.map((plan) => (
                            <Card 
                                key={plan.id} 
                                className={`bg-[#222429] border-none ${plan.recommended ? 'border-2 border-[#FFD110]' : ''}`}
                            >
                                <CardHeader>
                                    <CardTitle className="text-white text-2xl">
                                        {plan.name}
                                        {plan.recommended && (
                                            <span className="ml-2 text-sm bg-[#FFD110] text-black px-2 py-1 rounded">
                                                Recomendado
                                            </span>
                                        )}
                                    </CardTitle>
                                    <div className="text-[#FFD110] text-3xl font-bold mt-2">
                                        {plan.price}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-gray-300">
                                                {plan.id === "pro" ? (
                                                    <Check className="h-5 w-5 text-green-500 mr-2" />
                                                ) : (
                                                    <X className="h-5 w-5 text-red-500 mr-2" />
                                                )}
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    
                                    <div className="mt-6">
                                        {profile?.plan === plan.id ? (
                                            <Button 
                                                className="w-full bg-gray-600 text-white cursor-not-allowed"
                                                disabled
                                            >
                                                Plano Atual
                                            </Button>
                                        ) : (
                                            <Button
                                                className={`w-full ${plan.recommended ? 'bg-[#FFD110] hover:bg-[#E6C00F] text-black' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
                                                onClick={() => handleUpgrade(plan.id)}
                                                disabled={loading}
                                            >
                                                {loading ? "Processando..." : "Escolher Plano"}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Plans; 