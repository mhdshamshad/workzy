import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

import { MESSAGE_TYPE, type MessageType } from '@/constants';

interface MediaLightboxProps {
  open: boolean;
  onClose: () => void;
  type: MessageType;
  mediaUrl?: string;
  caption?: string;
}

export default function MediaLightbox({
  open,
  onClose,
  type,
  mediaUrl,
  caption,
}: MediaLightboxProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-md cursor-zoom-out"
        >
          <button
            onClick={onClose}
            aria-label="Close preview"
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all shadow-lg"
          >
            <X size={20} />
          </button>
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative max-w-5xl max-h-[80vh] overflow-hidden flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            {type === MESSAGE_TYPE.IMAGE ? (
              <img
                src={mediaUrl}
                alt="Full screen preview"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
              />
            ) : (
              <video
                src={mediaUrl}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
              />
            )}
            {caption && (
              <div className="mt-3 px-4 py-2 bg-black/60 backdrop-blur-sm text-white text-sm rounded-lg max-w-md text-center">
                {caption}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
