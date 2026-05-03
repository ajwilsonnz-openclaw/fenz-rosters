import SidebarWrapper from "@/components/layout/SidebarWrapper";
import Header from "@/components/layout/Header";

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <SidebarWrapper /> 
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Vacancy Management" />
        <main className="flex-1 overflow-y-auto bg-[#f3f7fa]">
          {children}
        </main>
      </div>
    </div>
  );
}