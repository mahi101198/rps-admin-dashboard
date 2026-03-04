export default function PlayStoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">RPS Stationery</h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-6 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
