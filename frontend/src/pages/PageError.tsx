import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/atoms/Button';

interface PageErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  showHome?: boolean;
  fullScreen?: boolean;
}

export default function PageError({
  title = 'Service Unavailable',
  description = 'Service is not responding. Please try again later.',
  onRetry,
  showHome = true,
  fullScreen = true,
}: PageErrorProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex items-center justify-center px-6 ${
        fullScreen ? 'min-h-screen' : 'min-h-[40vh] py-16'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
          className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6"
        >
          <AlertTriangle className="w-9 h-9 text-destructive" />
        </motion.div>

        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-8">{description}</p>

        <div className="flex flex-wrap gap-3 justify-center">
          {onRetry && (
            <Button
              variant="primary"
              iconLeft={<RefreshCw className="w-4 h-4" />}
              onClick={onRetry}
            >
              Try Again
            </Button>
          )}
          {showHome && (
            <Button
              variant="outline"
              iconLeft={<Home className="w-4 h-4" />}
              onClick={() => navigate('/')}
            >
              Go Home
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
