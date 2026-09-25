import loginImage from '@/assets/auth/login.webp';
import logo from '@/assets/icons/workzy-logo.svg';
import AuthLayout from '@/layouts/auth/AuthLayout';

import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout image={loginImage} logo={logo}>
      <LoginForm />
    </AuthLayout>
  );
}
