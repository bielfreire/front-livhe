import Layout from "@/components/Layout";
import { useTranslation } from "react-i18next";

const PaymentCancel = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1C24]">
        <div className="bg-[#222429] p-8 rounded-lg shadow-lg flex flex-col items-center">
          <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <h1 className="text-2xl font-bold text-white mb-2">{t('payment.cancel.title')}</h1>
          <p className="text-gray-300 mb-6">{t('payment.cancel.description')}</p>
          <a href="#/plans" className="bg-gray-600 text-white px-6 py-2 rounded font-semibold hover:bg-gray-700">
            {t('payment.cancel.backToPlans')}
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCancel;
