import Layout from "@/components/Layout";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1A1C24]">
        <div className="bg-[#222429] p-8 rounded-lg shadow-lg flex flex-col items-center">
          <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <h1 className="text-2xl font-bold text-white mb-2">Pagamento realizado com sucesso!</h1>
          <p className="text-gray-300 mb-6">Seu plano foi ativado. Aproveite todos os benefícios premium.</p>
          <Link to="/home" className="bg-[#FFD110] text-black px-6 py-2 rounded font-semibold hover:bg-[#e6c00f]">
            Ir para o painel
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
