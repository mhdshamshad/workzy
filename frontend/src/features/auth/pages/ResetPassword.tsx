import resetImg from '@/assets/auth/login.webp';
import logo from '@/assets/icons/workzy-logo.svg';
import AuthLayout from '@/layouts/auth/AuthLayout';

import ResetPasswordForm from '../components/ResetPasswordForm';

import type React from 'react';

const ResetPassword: React.FC = () => {
  return (
    <AuthLayout image={resetImg} logo={logo}>
      <ResetPasswordForm />
    </AuthLayout>
  );
};
export default ResetPassword;
