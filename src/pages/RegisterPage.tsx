import React from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

interface FormInputs {
  email: string;
  username: string;
  password: string;
}

const validation = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  username: Yup.string().required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({ resolver: yupResolver(validation) });

  const handleLogin: SubmitHandler<FormInputs> = (formData) => {
    registerUser(formData.email, formData.username, formData.password);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 h-screen">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
              Sign up
            </h1>

            <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  className="form-input"
                  placeholder="Email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  placeholder="Username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-red-600 text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="form-input"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-red-600 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full text-white bg-lime-700 hover:bg-emerald-500 font-medium rounded-lg text-sm px-5 py-2.5"
              >
                Sign up
              </button>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-primary-600 hover:underline dark:text-primary-500"
                  onClick={() => handleNavigate("/login")}
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;
