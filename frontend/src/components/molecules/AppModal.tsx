import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

import Button from '../atoms/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

import type React from 'react';

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  isDescriptionHidden?: boolean;
  isTitleHidden?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'blue' | 'green' | 'red';
  cancelText?: string;
  className?: string;
  isConfirmLoading?: boolean;
  isConfirmDisabled?: boolean;
  hideFooter?: boolean;
  footer?: React.ReactNode;
  canCloseOnOutsideClick?: boolean;
}

export function AppModal({
  open,
  onClose,
  children,
  title = 'Confirm Action',
  description = 'Please review the details and confirm the action.',
  isDescriptionHidden = true,
  isTitleHidden = false,
  hideFooter = false,
  onConfirm,
  confirmText = 'Confirm',
  buttonVariant,
  cancelText = 'Cancel',
  isConfirmLoading = false,
  isConfirmDisabled = false,
  footer,
  canCloseOnOutsideClick = true,
  className = 'sm:max-w-lg',
}: AppModalProps) {
  const DefaultFooter = !footer && (
    <div className="flex items-center justify-end gap-3 w-full">
      <Button variant="outline" onClick={onClose} disabled={isConfirmLoading} size="sm">
        {cancelText}
      </Button>
      {onConfirm && (
        <Button
          variant={buttonVariant}
          onClick={onConfirm}
          disabled={isConfirmLoading || isConfirmDisabled}
          loading={isConfirmLoading}
          size="sm"
        >
          {confirmText}
        </Button>
      )}
    </div>
  );

  const handleOpenChange = (next: boolean) => {
    if (!next && canCloseOnOutsideClick) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent
            className={cn(
              'max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-border shadow-2xl',
              className
            )}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex flex-col max-h-[90vh]"
            >
              {!isTitleHidden && (
                <DialogHeader className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {isTitleHidden ? (
                        <VisuallyHidden>
                          <DialogTitle>{title}</DialogTitle>
                        </VisuallyHidden>
                      ) : (
                        <DialogTitle className="text-lg font-semibold tracking-tight">
                          {title}
                        </DialogTitle>
                      )}

                      {description && !isDescriptionHidden ? (
                        <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                          {description}
                        </DialogDescription>
                      ) : (
                        <VisuallyHidden>
                          <DialogDescription>{description}</DialogDescription>
                        </VisuallyHidden>
                      )}
                    </div>
                  </div>
                </DialogHeader>
              )}

              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 custom-scrollbar">
                {children}
              </div>

              {!hideFooter && (footer || DefaultFooter) && (
                <div className="flex-shrink-0 px-6 py-4 border-t border-border bg-muted/30">
                  {footer || DefaultFooter}
                </div>
              )}
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
