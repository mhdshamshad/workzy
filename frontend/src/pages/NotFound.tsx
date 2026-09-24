import { motion } from 'framer-motion';
import { Home, MoveLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/atoms/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex flex-col items-center text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="relative mb-8 select-none"
        >
          <span className="text-[120px] sm:text-[160px] font-black text-foreground/5 leading-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl sm:text-6xl font-black bg-linear-to-r from-primary via-violet-500 to-pink-500 bg-clip-text text-transparent">
              404
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Page not found</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm">
            The page you're looking for doesn't exist or has been moved. Let's get you back on
            track.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              iconLeft={<MoveLeft className="w-4 h-4" />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button
              variant="primary"
              iconLeft={<Home className="w-4 h-4" />}
              onClick={() => navigate('/')}
            >
              Go Home
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
