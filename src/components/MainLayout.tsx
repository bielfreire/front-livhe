
import Sidebar from "./Sidebar"; // Sidebar com navegação
import Header from "./Header"; // Header da aplicação

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#1A1C24]">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col bg-[#1A1C24]">
          <Header />
          <main className="flex-1 p-6 bg-[#1A1C24]">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
