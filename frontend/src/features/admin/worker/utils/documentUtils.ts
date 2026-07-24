import { Camera, FileText, IdCard, UserSquare2 } from 'lucide-react';

import { DOCUMENT_TYPE, type DocumentType } from '@/constants';

import type React from 'react';

export const MANDATORY_DOCUMENT_TYPES: DocumentType[] = [
  DOCUMENT_TYPE.AADHAAR,
  DOCUMENT_TYPE.PAN,
  DOCUMENT_TYPE.PROFILE_PHOTO,
  DOCUMENT_TYPE.SELFIE_VERIFICATION,
];

export const DOCUMENT_INFO_MAP: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  aadhaar: { label: 'Aadhaar Card', icon: IdCard },
  pan: { label: 'PAN Card', icon: FileText },
  selfie_verification: { label: 'Selfie Verification', icon: Camera },
  profile_photo: { label: 'Profile Photo', icon: UserSquare2 },
};

export const getDocInfo = (type: string) => {
  return (
    DOCUMENT_INFO_MAP[type] || {
      label: type
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      icon: FileText,
    }
  );
};
