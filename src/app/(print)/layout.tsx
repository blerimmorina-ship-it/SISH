export const metadata = { title: "Print" };

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-black min-h-screen">
      <style>{`
        @page { size: A4; margin: 18mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      {children}
    </div>
  );
}
