import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5EF] text-[#0F172A]">
      <Navbar />
      <div className="flex-1 flex flex-col">{children}</div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
