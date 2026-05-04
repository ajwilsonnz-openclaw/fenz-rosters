export const dynamic = 'force-dynamic';

import SidebarWrapper from "@/components/layout/SidebarWrapper";
import Header from "@/components/layout/Header";

export default function ManageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white">
      <Header title="Vacancy Management" />
      <div className="flex flex-1 overflow-hidden">
        <SidebarWrapper /> 
        <main className="flex-1 overflow-y-auto bg-[#f3f7fa]">
          {children}
        </main>
      </div>
    </div>
  );
}