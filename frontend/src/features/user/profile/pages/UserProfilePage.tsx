import { useState } from 'react';
import { toast } from 'sonner';

import PageHeader from '@/components/molecules/PageHeader';
import ProfileImage from '@/components/molecules/ProfileImage';
import ProfileImageModal from '@/components/molecules/ProfileImageModal';
import { Separator } from '@/components/ui/separator';
import ChangePasswordModal from '@/features/profile/modals/ChangePasswordModal';
import ContactChangeModal from '@/features/profile/modals/ContactChangeModal';
import OtpModal from '@/features/profile/modals/OtpModal';
import AccountChangeActions from '@/features/user/profile/components/AccountChangeActions';
import type { ChangePasswordFormType } from '@/features/user/profile/validation/passwordShema';
import type { ProfileFormType } from '@/features/user/profile/validation/profileSchema';
import PageError from '@/pages/PageError';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import type { RootState } from '@/store/store';
import { handleApiError } from '@/utils/handleApiError';

import ProfileInfoSection from '../components/ProfileInfoSection';
import {
  useUpdateUserProfile,
  useUserProfileImageUpload,
  useUserResendOtp,
  useUserUpdateEmail,
  useUserUpdatePassword,
  useUserUpdatePhone,
  useUserVerifyOtp,
} from '../hooks/useUserProfile';

type ModalType = 'image' | 'email' | 'phone' | 'password' | 'otp' | null;

export default function ProfilePage() {
  const { user } = useAppSelector((s: RootState) => s.auth);
  const dispatch = useAppDispatch();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [otpData, setOtpData] = useState<{ type: 'email' | 'phone'; value: string } | null>(null);
  const { imageUploading, progress, uploadImage } = useUserProfileImageUpload();
  const { mutateAsync: updateProfile } = useUpdateUserProfile();
  const { mutateAsync: resendOtp, isPending: isResending } = useUserResendOtp();
  const { mutateAsync: verifyOtp, isPending: isVerifying } = useUserVerifyOtp();
  const { mutateAsync: updatePhone, isPending: isUpdatingPhone } = useUserUpdatePhone();
  const { mutateAsync: updateEmail, isPending: isUpdatingEmail } = useUserUpdateEmail();
  const { mutateAsync: updatePassword } = useUserUpdatePassword();

  const { profileImage, email, name } = user ?? {};

  function handleOtpRequest(type: 'email' | 'phone', value: string) {
    setOtpData({ type, value });
    setActiveModal('otp');
  }

  const handleImageUpload = async (file: File) => {
    const url = await uploadImage(file);
    dispatch(updateUser({ profileImage: url }));
  };

  const handleProfileUpdate = async (data: ProfileFormType): Promise<string> => {
    try {
      const { message, user } = await updateProfile(data);
      dispatch(updateUser({ profile: user.profile, name: user.name }));
      return message;
    } catch (error) {
      toast.error(handleApiError(error));
      return '';
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!otpData) {
      return;
    }

    const { user, message } = await verifyOtp({
      type: otpData.type,
      contact: otpData.value,
      otp,
    });
    dispatch(updateUser({ email: user.email, phone: user?.phone }));
    toast.success(message);
  };

  const handleResendOtp = async () => {
    if (!otpData) {
      return;
    }
    const res = await resendOtp({
      type: otpData.type,
      value: otpData.value,
    });

    toast.success(res.message);
  };

  const handleUpdatePassword = async (data: ChangePasswordFormType) => {
    const { message } = await updatePassword(data);
    toast.success(message);
    return message;
  };

  if (!user) {
    return <PageError />;
  }

  return (
    <div className="section-container">
      <div className="p-4 lg:text-left md:text-center s:text-center">
        <PageHeader title="My Profile" description="Manage your personal information" />
      </div>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="bg-card rounded-xl border p-6 flex flex-col items-center gap-4">
          <div className="text-center">
            <ProfileImage
              src={profileImage}
              name={name}
              editable
              loading={imageUploading}
              progress={progress}
              onClickImage={() => setActiveModal('image')}
              onChange={handleImageUpload}
            />
            <h2 className="text-2xl font-bold text-muted-foreground-700 mt-4">{name}</h2>
            <p className="text-muted-foreground-500 mt-1">{email}</p>
          </div>
          <Separator />
          <AccountChangeActions
            onChangeEmail={() => setActiveModal('email')}
            onChangePhone={() => setActiveModal('phone')}
            onChangePassword={() => setActiveModal('password')}
          />
        </div>

        <ProfileInfoSection user={user} onSubmit={handleProfileUpdate} />
        <ContactChangeModal
          open={activeModal === 'email'}
          onClose={() => setActiveModal(null)}
          currentValue={user.email ?? ''}
          userEmail={user?.email ?? ''}
          onConfirm={async (email: string) => {
            const { message } = await updateEmail(email);
            toast.success(message);
            handleOtpRequest('email', email);
          }}
          isPending={isUpdatingEmail}
          type="email"
        />
        <ContactChangeModal
          open={activeModal === 'phone'}
          onClose={() => setActiveModal(null)}
          currentValue={user.phone ?? ''}
          userEmail={user?.email ?? ''}
          onConfirm={async (phone: string) => {
            const { message } = await updatePhone(phone);
            toast.success(message);
            handleOtpRequest('phone', phone);
          }}
          isPending={isUpdatingPhone}
        />
        <OtpModal
          open={activeModal === 'otp'}
          onOpenChange={(v: boolean) => setActiveModal(v ? 'otp' : null)}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          loading={isResending || isVerifying}
        />
        <ChangePasswordModal
          open={activeModal === 'password'}
          onOpenChange={(v: boolean) => setActiveModal(v ? 'password' : null)}
          onConfirm={handleUpdatePassword}
        />
        <ProfileImageModal
          open={activeModal === 'image'}
          onOpenChange={(v: boolean) => setActiveModal(v ? 'image' : null)}
          image={user.profileImage}
        />
      </div>
    </div>
  );
}
