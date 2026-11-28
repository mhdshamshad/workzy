import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  image: string | undefined;
}
export default function ProfileImageModal({ open, onOpenChange, image }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none flex items-center justify-center max-w-3xl">
        <VisuallyHidden>
          <DialogTitle>Profile Image</DialogTitle>
          <DialogDescription>Preview of profile image</DialogDescription>
        </VisuallyHidden>

        <img
          src={image}
          alt="Profile"
          className="max-h-[85vh] max-w-full object-contain rounded-xl"
        />
      </DialogContent>
    </Dialog>
  );
}
