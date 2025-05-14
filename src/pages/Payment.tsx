import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/utils/api";
import { ArrowLeft } from "lucide-react";

const Payment = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Aqui você faria a integração com a API de pagamento
            await apiRequest("/payment/process", {
                method: "POST",
                body: {
                    ...formData,
                    plan: "pro"
                },
                isAuthenticated: true
            });

            toast({
                title: "Pagamento realizado com sucesso!",
                description: "Seu plano foi atualizado para Pro. Aproveite todos os benefícios!"
            });

            // Redireciona para a página de planos após o pagamento
            navigate("/plans");
        } catch (error) {
            toast({
                title: "Erro no pagamento",
                description: "Ocorreu um erro ao processar seu pagamento. Verifique os dados e tente novamente.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-[#1A1C24] p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/plans")}
                            className="text-gray-400 hover:text-white"
                        >
                            <ArrowLeft className="mr-2" />
                            Voltar para Planos
                        </Button>
                    </div>

                    <Card className="bg-[#222429] border-none">
                        <CardHeader>
                            <CardTitle className="text-white text-2xl">
                                Pagamento - Plano Pro
                            </CardTitle>
                            <div className="text-[#FFD110] text-3xl font-bold mt-2">
                                R$ 19,90/mês
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber" className="text-gray-300">
                                        Número do Cartão
                                    </Label>
                                    <Input
                                        id="cardNumber"
                                        name="cardNumber"
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        value={formData.cardNumber}
                                        onChange={handleChange}
                                        className="bg-[#2A2D36] text-white border-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cardName" className="text-gray-300">
                                        Nome no Cartão
                                    </Label>
                                    <Input
                                        id="cardName"
                                        name="cardName"
                                        type="text"
                                        placeholder="Nome como está no cartão"
                                        value={formData.cardName}
                                        onChange={handleChange}
                                        className="bg-[#2A2D36] text-white border-none"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiryDate" className="text-gray-300">
                                            Data de Validade
                                        </Label>
                                        <Input
                                            id="expiryDate"
                                            name="expiryDate"
                                            type="text"
                                            placeholder="MM/AA"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            className="bg-[#2A2D36] text-white border-none"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cvv" className="text-gray-300">
                                            CVV
                                        </Label>
                                        <Input
                                            id="cvv"
                                            name="cvv"
                                            type="text"
                                            placeholder="000"
                                            value={formData.cvv}
                                            onChange={handleChange}
                                            className="bg-[#2A2D36] text-white border-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#FFD110] hover:bg-[#E6C00F] text-black font-medium"
                                    disabled={loading}
                                >
                                    {loading ? "Processando..." : "Confirmar Pagamento"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default Payment; 