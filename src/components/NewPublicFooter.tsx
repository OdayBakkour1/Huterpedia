const NewPublicFooter = () => (
  <footer className="relative z-10 bg-white/5 backdrop-blur-2xl border-t border-white/10 py-8">
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center space-x-4 mb-6 cursor-pointer">
            <img src="/HunterPedia Png-01.png" alt="Hunterpedia Logo" className="h-20 w-20 object-contain" />
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">Hunterpedia</h3>
              <p className="text-white/60">Built for the defenders of the digital age.</p>
            </div>
          </div>
          <p className="text-white/50">© 2025 Hunterpedia. All Rights Reserved To Cyberpedia</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
          <ul className="space-y-3 text-white/60">
            <li><a href="/about" className="hover:text-cyan-400 transition-colors duration-300">About</a></li>
            <li><a href="/contact" className="hover:text-cyan-400 transition-colors duration-300">Contact</a></li>
            <li><a href="/pricing" className="hover:text-cyan-400 transition-colors duration-300">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Legal</h4>
          <ul className="space-y-3 text-white/60">
            <li><a href="/privacy" className="hover:text-cyan-400 transition-colors duration-300">Privacy</a></li>
            <li><a href="/terms" className="hover:text-cyan-400 transition-colors duration-300">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 pt-4 text-center">
        <div className="flex justify-center space-x-6">
          <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter h-6 w-6"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
          </a>
          <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin h-6 w-6"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </a>
          <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook h-6 w-6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors duration-300 transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram h-6 w-6"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default NewPublicFooter; 