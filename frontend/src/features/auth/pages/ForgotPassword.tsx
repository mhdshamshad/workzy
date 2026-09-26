import loginImage from '@/assets/auth/login.webp';
import logo from '@/assets/icons/workzy-logo.svg';
import AuthLayout from '@/layouts/auth/AuthLayout';

import ForgotForm from '../components/ForgotPasswordForm';

import type React from 'react';

const ForgotPassword: React.FC = () => {
  return (
    <AuthLayout image={loginImage} logo={logo}>
      <ForgotForm />
    </AuthLayout>
  );
};

export default ForgotPassword;
