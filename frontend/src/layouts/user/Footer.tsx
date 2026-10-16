import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import CategoryService from '@/services/category.service';
import { useAppSelector } from '@/store/hooks';

const LINK_CLASS = 'hover:text-white transition-colors';

const COMPANY_LINKS = [
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

const PROFESSIONAL_LINKS = [
  { to: '/join-us', label: 'Join as Professional' },
  { to: '/disputes', label: 'Support' },
];

const LEGAL_LINKS = [
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/refund-policy', label: 'Refund & Cancellation' },
];

export default function Footer() {
  const { isAuthenticated } = useAppSelector(s => s.auth);
  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'levels', 1],
    queryFn: () => CategoryService.getCategoryLevels(1),
    staleTime: 20 * 60 * 1000,
  });

  const scrollTop = () => window.scrollTo({ top: 0, left: 0 });

  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link
              to="/"
              onClick={scrollTop}
              className="inline-block text-3xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4"
            >
              Workzy
            </Link>
            <p className="text-sm leading-relaxed">
              Professional services at your doorstep. Book trusted professionals with secure
              payments.
            </p>
          </div>

          {categories.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm">
                {categories.slice(0, 3).map(category => (
                  <li key={category.id}>
                    <Link
                      to={`/services?category=${category.id}`}
                      onClick={scrollTop}
                      className={LINK_CLASS}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              {COMPANY_LINKS.map(link => (
                <li key={link.to}>
                  <Link to={link.to} onClick={scrollTop} className={LINK_CLASS}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Professionals</h3>
            <ul className="space-y-2 text-sm">
              {PROFESSIONAL_LINKS.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to === '/disputes' && !isAuthenticated ? '/login' : link.to}
                    state={
                      link.to === '/disputes' && !isAuthenticated ? { from: link.to } : undefined
                    }
                    onClick={scrollTop}
                    className={LINK_CLASS}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">© {new Date().getFullYear()} Workzy. All rights reserved.</div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {LEGAL_LINKS.map(link => (
              <Link key={link.to} to={link.to} onClick={scrollTop} className={LINK_CLASS}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
