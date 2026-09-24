export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="text-3xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Workzy
            </div>
            <p className="text-sm leading-relaxed">
              Professional services at your doorstep. Trusted by millions.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Home Repair
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cleaning
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Beauty & Wellness
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Tech Support
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">For Professionals</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Join as Professional
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Partner Program
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Resources
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">© 2024 Workzy. All rights reserved.</div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
