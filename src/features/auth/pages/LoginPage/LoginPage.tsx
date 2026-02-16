import React from 'react';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthLayout } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface LoginFormInputs {
  username: string;
  password: string;
}

const validation = Yup.object().shape({
  username: Yup.string().required('Korisničko ime je obavezno'),
  password: Yup.string().required('Lozinka je obavezna'),
});

const LoginPage: React.FC = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(validation),
  });

  const handleLogin: SubmitHandler<LoginFormInputs> = async (form) => {
    await loginUser(form.username, form.password);
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Prijavite se na svoj račun
          </h1>
          <p className="text-sm text-muted-foreground">
            Unesite svoje podatke za nastavak
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">Korisničko ime</Label>
            <Input
              id="username"
              type="text"
              placeholder="Unesite korisničko ime"
              {...register('username')}
              className={errors.username ? 'border-destructive' : ''}
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Lozinka</Label>
              <a
                href="#"
                className="text-sm text-primary hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Zaboravili lozinku?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Prijavljivanje...' : 'Prijavi se'}
          </Button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground">
          Nemate račun?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-primary font-medium hover:underline cursor-pointer"
          >
            Registrujte se
          </span>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
