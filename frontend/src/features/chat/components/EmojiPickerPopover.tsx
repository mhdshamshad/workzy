import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';
import { memo, useEffect, useRef } from 'react';

import { useTheme } from '@/context/theme/use-theme';

interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPickerPopover = memo(({ onSelectEmoji, onClose }: EmojiPickerPopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? Theme.DARK
        : Theme.LIGHT
      : theme === 'dark'
        ? Theme.DARK
        : Theme.LIGHT;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full left-0 mb-2 z-50 rounded-2xl overflow-hidden shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-100"
      onClick={e => e.stopPropagation()}
    >
      <EmojiPicker
        onEmojiClick={(emojiData: EmojiClickData) => onSelectEmoji(emojiData.emoji)}
        theme={resolvedTheme}
        width="100%"
        height={360}
        lazyLoadEmojis
        className="w-64! sm:w-72! md:w-80!"
      />
    </div>
  );
});

export default EmojiPickerPopover;
