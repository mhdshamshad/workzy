import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Mail, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import PasswordInput from '@/components/atoms/PasswordInput';
import PageHeader from '@/components/molecules/PageHeader';
import { registerService } from '@/services/auth.service';
import { getInternalRedirectPath } from '@/utils/authRedirect';
import { handleApiError } from '@/utils/handleApiError';

import { signupSchema, type SignupSchemaType } from '../validation/signupSchema';

export default function SignupForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchemaType>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignupSchemaType) => {
    try {
      const res = await registerService(data);
      toast.success(res.message);
      navigate('/verify-otp', {
        state: {
          email: data.email,
          password: data.password,
          from: getInternalRedirectPath(location.state?.from),
        },
      });
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        title="Create your Workzy account"
        description="Let's get started with your registration"
      />
      {/* name  */}
      <div>
        <Label>Name</Label>
        <Input
          placeholder="Enter your full name"
          leftIcon={<User />}
          error={errors.name?.message}
          {...register('name', {
            setValueAs: v => v.trim(),
          })}
        />
      </div>
      {/* email  */}
      <div>
        <Label>Email Address</Label>
        <Input
          placeholder="Enter your email"
          leftIcon={<Mail />}
          error={errors.email?.message}
          {...register('email', {
            setValueAs: v => v.trim(),
          })}
        />
      </div>

      {/* Password */}
      <div>
        <Label>Password</Label>
        <PasswordInput
          placeholder="Create a strong password"
          error={errors.password?.message}
          {...register('password', {
            setValueAs: v => v.trim(),
          })}
        />
      </div>

      <Button type="submit" fullWidth loading={isSubmitting} iconRight={<ArrowRight />}>
        Sign Up
      </Button>

      {/* login Link */}
      <p className="text-center text-muted-foreground">
        Already have an account?{' '}
        <Link
          className="text-primary font-medium hover:underline"
          to="/login"
          state={{ from: getInternalRedirectPath(location.state?.from) }}
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
