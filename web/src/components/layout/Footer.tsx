import { Layers } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-20 border-t border-white/10 bg-bg-dark">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                <Layers className="text-black w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tighter text-white">STAROSCA</span>
            </div>
            <p className="text-white/40 max-w-sm">
              The foundational layer for decentralized social savings. Building the infrastructure for a more secure, and intelligent rotating savings protocol.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-white">Resources</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Yield Strategy</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Chainlink VRF</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">System Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 uppercase text-white">Community</h4>
            <ul className="space-y-4 text-white/40 text-sm">
              <li><a href="#" className="hover:text-brand-primary transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Telegram</a></li>
              <li><a href="#" className="hover:text-brand-primary transition-colors">Forum</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5 text-white/20 text-xs uppercase tracking-widest">
          <div>© 2026 STAROSCA FOUNDATION. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

