import signupImage from '@/assets/auth/signup.webp';
import logo from '@/assets/icons/workzy-logo.svg';
import AuthLayout from '@/layouts/auth/AuthLayout';

import SignupForm from '../components/SignupForm';

import type React from 'react';

const SignupPage: React.FC = () => {
  return (
    <AuthLayout image={signupImage} logo={logo}>
      <SignupForm />
    </AuthLayout>
  );
};
export default SignupPage;
