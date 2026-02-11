export function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-zinc-500">
            Starosca — Collateralized ROSCA on Base
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>Powered by Chainlink</span>
            <span>|</span>
            <span>Base Sepolia Testnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
