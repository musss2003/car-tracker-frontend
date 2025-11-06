import React from 'react';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { useAuth } from '../../hooks/useAuth';


interface LoginFormInputs {
  username: string;
  password: string;
}

const validation = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const LoginPage: React.FC = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(validation),
  });

  const handleLogin: SubmitHandler<LoginFormInputs> = async (form) => {
    await loginUser(form.username, form.password);
  };

  return (
    <section className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-content">
            <h1 className="login-title">Sign in to your account</h1>
            <form className="login-form" onSubmit={handleSubmit(handleLogin)}>
              <div>
                <label htmlFor="username" className="login-label">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="login-input"
                  placeholder="Username"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="login-error">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="login-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="login-input"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="login-error">{errors.password.message}</p>
                )}
              </div>

              <div className="login-links">
                <a href="#">Forgot password?</a>
              </div>

              <button type="submit" className="login-button">
                Sign in
              </button>

              <p className="login-register">
                Don’t have an account yet?{' '}
                <span
                  className="register-link"
                  onClick={() => navigate('/register')}
                >
                  Sign up
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
