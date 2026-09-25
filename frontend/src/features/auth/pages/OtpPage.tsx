import otpImage from '@/assets/auth/otp.jpeg';
import logo from '@/assets/icons/workzy-logo.svg';
import AuthLayout from '@/layouts/auth/AuthLayout';

import OtpForm from '../components/OtpForm';

import type React from 'react';

const OtpPage: React.FC = () => {
  return (
    <AuthLayout image={otpImage} logo={logo}>
      <OtpForm />
    </AuthLayout>
  );
};

export default OtpPage;
