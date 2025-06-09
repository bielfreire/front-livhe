import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { apiRequest } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Calendar, CreditCard } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { useTranslation } from "react-i18next";
import { stripePromise } from "@/utils/stripe";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface Plan {
    id: string;
    name: string;
    price: string;
    features: string[];
    recommended?: boolean;
}

interface SubscriptionInfo {
    planName: string;
    startDate: string;
    nextBillingDate: string;
    status: string;
}

const Plans = () => {
    const navigate = useNavigate();
    const { profile, isLoading } = useProfile();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
    const [showCreatorsModal, setShowCreatorsModal] = useState(false);
    const [creatorsConfirmed, setCreatorsConfirmed] = useState(false);
    const [qrPreviewOpen, setQrPreviewOpen] = useState(false);
    const [showScannerHelp, setShowScannerHelp] = useState(false);
    const [showAgencyBenefits, setShowAgencyBenefits] = useState(false);
    const [isApproved, setIsApproved] = useState<boolean | null>(null);

    const plans: Plan[] = [

        {
            id: "premium",
            name: t('plans.premium.name'),
            price: t('plans.premium.price'),
            features: (t('plans.premium.features', { returnObjects: true }) as string[]),
            recommended: true
        },
        {
            id: "creators",
            name: t('plans.creators.name'),
            price: t('plans.creators.price'),
            features: (t('plans.creators.features', { returnObjects: true }) as string[])
        },
        {
            id: "free",
            name: t('plans.free.name'),
            price: t('plans.free.price'),
            features: (t('plans.free.features', { returnObjects: true }) as string[])
        },
    ];

    const handleUpgrade = async (planId: string) => {
        if (planId === "free") return;
        setLoading(true);
        try {
            const res = await apiRequest("/stripe/create-checkout-session", {
                method: "POST",
                body: { 
                    planId, 
                    email: profile?.email,
                    productId: planId === "creators" ? "price_1RX4xwB3EwPQ5VYorimVdhE5" : undefined
                },
                isAuthenticated: true,
            });
            const stripe = await stripePromise;
            if (stripe && res.url) {
                window.location.href = res.url;
            } else {
                toast({ title: t('plans.error'), description: t('plans.stripeError'), variant: "destructive" });
            }
        } catch (error) {
            toast({ title: t('plans.error'), description: t('plans.stripeError'), variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchSubscriptionInfo = async () => {
        try {
            const res = await apiRequest("/stripe/subscription-info", {
                method: "GET",
                isAuthenticated: true,
            });
            if (res) {
                setSubscriptionInfo(res);
            }
        } catch (error) {
            console.error("Error fetching subscription info:", error);
        }
    };

    useEffect(() => {
        if (profile?.plan && profile.plan !== "free") {
            fetchSubscriptionInfo();
        }
    }, [profile?.plan]);

    useEffect(() => {
        // Buscar o status de aprovação do usuário quando o componente montar
        const fetchApprovalStatus = async () => {
            try {
                const response = await apiRequest('/users/profile', {
                    method: 'GET',
                    isAuthenticated: true,
                });
                setIsApproved(response.check);
            } catch (error) {
                console.error('Erro ao buscar status de aprovação:', error);
            }
        };

        fetchApprovalStatus();
    }, []);

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
            <Breadcrumb
                items={[
                    { label: t('common.home'), path: "/home" },
                    { label: t('navigation.plans'), path: "/plans" },
                ]}
            />
            <div className="min-h-screen bg-[#1A1C24] p-6">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8">{t('plans.title')}</h1>

                    {subscriptionInfo && (
                        <div className="mb-8 p-6 bg-[#222429] rounded-lg border border-green-500">
                            <h2 className="text-xl font-semibold text-white mb-4">{t('plans.subscriptionInfo.title')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center space-x-2">
                                    <CreditCard className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-gray-400 text-sm">{t('plans.subscriptionInfo.currentPlan')}</p>
                                        <p className="text-white font-medium">{subscriptionInfo.planName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-gray-400 text-sm">{t('plans.subscriptionInfo.startDate')}</p>
                                        <p className="text-white font-medium">{new Date(subscriptionInfo.startDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-gray-400 text-sm">{t('plans.subscriptionInfo.nextBilling')}</p>
                                        <p className="text-white font-medium">{new Date(subscriptionInfo.nextBillingDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plans.map((plan) => (
                            <Card
                                key={plan.id}
                                className={`bg-[#222429] border-none ${plan.recommended ? 'border-2 border-[#FFD110]' : ''
                                    } ${(profile?.plan === plan.id || (profile?.plan === 'premium+creators' && plan.id === 'creators')) ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-[#1A1C24]' : ''
                                    } relative`}
                            >
                                {plan.id === 'creators' && (
                                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="rounded-full bg-[#000000] p-1 shadow-lg border-2 border-white animate-pulse cursor-pointer">
                                                        <img
                                                            src={"assets/logo-mont-agency.png"}
                                                            alt="Mont Agency Logo"
                                                            className="w-12 h-12 object-contain rounded-full"
                                                        />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="left" className="text-xs font-semibold">
                                                    {t('plans.creators.agencyTooltip')}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-white text-2xl">
                                        {plan.name}
                                        {plan.recommended && (
                                            <span className="ml-2 text-sm bg-[#FFD110] text-black px-2 py-1 rounded">
                                                {t('plans.recommended')}
                                            </span>
                                        )}
                                        {(profile?.plan === plan.id || (profile?.plan === 'premium+creators' && plan.id === 'creators')) && (
                                            <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded">
                                                {t('plans.currentPlan')}
                                            </span>
                                        )}
                                    </CardTitle>
                                    <div className="text-[#FFD110] text-3xl font-bold mt-2">
                                        {plan.price}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {plan.id === 'creators' ? (
                                            <>
                                                <li className="mb-4">
                                                    <div className="flex items-center bg-gradient-to-r from-green-400 to-green-200 text-black font-semibold rounded-lg px-4 py-3 shadow-lg border border-green-500">
                                                        <span className="mr-3">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#22c55e" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a5.25 5.25 0 11-7.44-7.44 5.25 5.25 0 017.44 7.44z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25v.008h.008V8.25H16.5zm-9 7.5v.008h.008v-.008H7.5z" /></svg>
                                                        </span>
                                                        <span>{plan.features[plan.features.length - 1]}</span>
                                                    </div>
                                                </li>
                                                {plan.features.slice(0, -1).map((feature, index) => (
                                                    <li key={index} className="flex items-center text-gray-300">
                                                        <Check className="h-5 w-5 text-green-500 mr-2" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </>
                                        ) : (
                                            plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-center text-gray-300">
                                                    {plan.id === "premium" ? (
                                                        <Check className="h-5 w-5 text-green-500 mr-2" />
                                                    ) : (
                                                        <X className="h-5 w-5 text-red-500 mr-2" />
                                                    )}
                                                    {feature}
                                                </li>
                                            ))
                                        )}
                                    </ul>

                                    <div className="mt-6">
                                        {profile?.plan === plan.id || (profile?.plan === 'premium+creators' && plan.id === 'creators') ? (
                                            <Button
                                                className="w-full bg-gray-600 text-white cursor-not-allowed"
                                                disabled
                                            >
                                                {t('plans.currentPlan')}
                                            </Button>
                                        ) : plan.id === 'creators' ? (
                                            <Button
                                                className="w-full bg-[#FFD110] hover:bg-[#E6C00F] text-black"
                                                onClick={() => { setShowCreatorsModal(true); setCreatorsConfirmed(false); }}
                                                disabled={loading}
                                            >
                                                {t('plans.choosePlan')}
                                            </Button>
                                        ) : (
                                            <Button
                                                className={`w-full ${plan.recommended ? 'bg-[#FFD110] hover:bg-[#E6C00F] text-black' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
                                                onClick={() => handleUpgrade(plan.id)}
                                                disabled={loading}
                                            >
                                                {loading ? t('plans.processing') : t('plans.choosePlan')}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {showCreatorsModal && (
                <Dialog open={showCreatorsModal} onOpenChange={setShowCreatorsModal}>
                    <DialogContent className="max-w-lg overflow-y-auto max-h-[90vh] bg-[#1A1C24]">
                        <div className="flex items-center justify-between mb-2">
                            <DialogTitle className="text-white">{t('plans.creators.modal.title')}</DialogTitle>

                            <div className="flex items-center gap-2">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="rounded-full bg-[#000000] p-1 shadow-lg border-2 border-white animate-pulse cursor-pointer">
                                                <img
                                                    src={"assets/logo-mont-agency.png"}
                                                    alt="Mont Agency Logo"
                                                    className="w-12 h-12 object-contain rounded-full"
                                                />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="left" className="text-xs font-semibold">
                                            {t('plans.creators.agencyTooltip')}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <DialogDescription>
                            <div className="flex flex-col items-center gap-4 mt-2 w-full">
                                <div className="bg-[#1A1C24] p-4 rounded-lg flex items-center justify-center shadow-md w-full">
                                    <img
                                        src={"assets/qr-code.png"}
                                        alt="QR Code Mont Agency"
                                        className="w-auto max-w-full max-h-[40vh] cursor-zoom-in"
                                        style={{ imageRendering: 'crisp-edges' }}
                                        onClick={() => setQrPreviewOpen(true)}
                                        title={t('plans.creators.modal.clickToZoom')}
                                    />
                                </div>
                                <Button
                                    className="w-full mt-2 bg-[#FFD110] hover:bg-[#E6C00F] text-black"
                                    onClick={() => setShowScannerHelp(true)}
                                >
                                    {t('plans.creators.modal.howToScan')}
                                </Button>
                                <Button
                                    className="w-full mt-2 bg-[#FFD110] hover:bg-[#E6C00F] text-black"
                                    onClick={() => setShowAgencyBenefits(true)}
                                >
                                    {t('plans.creators.modal.agencyBenefits')}
                                </Button>
                                <span className="text-gray-200 text-center text-base mt-2">
                                    {t('plans.creators.modal.description')}
                                </span>
                                {!creatorsConfirmed ? (
                                    <Button 
                                        className="bg-green-600 hover:bg-green-700 text-black w-full mt-2" 
                                        onClick={() => setCreatorsConfirmed(true)}
                                    >
                                        {t('plans.creators.modal.alreadyRegistered')}
                                    </Button>
                                ) : isApproved ? (
                                    <>
                                        <div className="w-full mt-2 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#22c55e" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <h3 className="text-green-400 font-semibold">
                                                    Parabéns! Você foi aprovado!
                                                </h3>
                                            </div>
                                            <p className="text-gray-300 text-sm">
                                                Você foi aprovado para fazer parte do Creators Club! Agora você pode prosseguir com o pagamento para ter acesso a todos os benefícios exclusivos.
                                            </p>
                                        </div>
                                        <Button 
                                            className="bg-[#FFD110] hover:bg-[#E6C00F] text-black w-full mt-2" 
                                            onClick={() => { setShowCreatorsModal(false); handleUpgrade('creators'); }}
                                        >
                                            {t('plans.creators.modal.proceedToPayment')}
                                        </Button>
                                    </>
                                ) : (
                                    <div className="w-full mt-2 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                                        <h3 className="text-yellow-400 font-semibold mb-2">
                                            Aguardando Aprovação
                                        </h3>
                                        <p className="text-gray-300 text-sm">
                                            Sua inscrição está sendo analisada. Você receberá um e-mail assim que for aprovado para prosseguir com o pagamento.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogContent>
                </Dialog>
            )}

            {/* Modal para ampliar o QR code */}
            <Dialog open={qrPreviewOpen} onOpenChange={setQrPreviewOpen}>
                <DialogContent className="flex flex-col items-center justify-center bg-[#1A1C24] p-0 max-w-2xl">
                    <img
                        src={"assets/qr-code.png"}
                        alt="QR Code Mont Agency"
                        className="w-auto max-w-full max-h-[80vh]"
                        style={{ imageRendering: 'crisp-edges' }}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal de instrução de como escanear o QR code */}
            <Dialog open={showScannerHelp} onOpenChange={setShowScannerHelp}>
                <DialogContent className="flex flex-col items-center justify-center bg-[#1A1C24] p-0 max-w-2xl">
                    <img
                        src={"assets/help.png"}
                        alt={t('plans.creators.modal.scannerHelpAlt')}
                        className="w-auto max-w-full max-h-[80vh]"
                    />
                </DialogContent>
            </Dialog>

            {/* Modal de benefícios e requisitos de agenciamento */}
            <Dialog open={showAgencyBenefits} onOpenChange={setShowAgencyBenefits}>
                <DialogContent className="flex flex-col items-center justify-center bg-[#1A1C24] max-w-3xl">
                    <h2 className="text-2xl font-bold text-[#FFD110] mb-4 text-center">{t('plans.creators.modal.agencyBenefitsTitle')}</h2>
                    <img
                        src={"assets/proposta.png"}
                        alt={t('plans.creators.modal.agencyBenefitsAlt')}
                        className="w-auto max-w-full max-h-[40vh] mb-6"
                    />
                    <div className="w-full max-w-xl">
                        <h3 className="text-lg font-semibold text-[#FFD110] mb-2">{t('plans.creators.modal.requirements')}</h3>
                        <ul className="list-disc pl-5 text-gray-200 text-base space-y-2">
                            <li>{t('plans.creators.modal.requirementsList.requiriment')}</li>
                            <li>{t('plans.creators.modal.requirementsList.availability')}</li>
                            <li>{t('plans.creators.modal.requirementsList.diamonds')}</li>
                            <li>{t('plans.creators.modal.requirementsList.video')}</li>
                            <li>{t('plans.creators.modal.requirementsList.commitment')}</li>
                        </ul>
                    </div>
                    <div className="w-full flex justify-end mt-6">
                        <Button
                            className="bg-[#FFD110] hover:bg-[#E6C00F] text-black"
                            onClick={() => setShowAgencyBenefits(false)}
                        >
                            {t('moods.presetConfig.close')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Layout>
    );
};

export default Plans;