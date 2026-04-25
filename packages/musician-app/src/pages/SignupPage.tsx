import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { signUpMusician } from '../services/auth';
import { useToast } from '../contexts/ToastContext';

interface Form { fullName: string; email: string; password: string }

export const SignupPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (v: Form) => {
    setLoading(true);
    try {
      await signUpMusician(v.email, v.password, v.fullName);
      toast('success', 'Welcome! Let’s set up your profile.');
      navigate('/onboarding');
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl bg-elev p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold">Join MyGigs as a musician</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input className="w-full rounded-lg border px-3 py-2"
            {...register('fullName', { required: 'Name required' })} />
          {errors.fullName && <p className="mt-1 text-xs text-red-400">{errors.fullName.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" className="w-full rounded-lg border px-3 py-2"
            {...register('email', { required: 'Email required' })} />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input type="password" className="w-full rounded-lg border px-3 py-2"
            {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 chars' } })} />
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>
        <button disabled={loading} type="submit"
          className="w-full rounded-lg bg-brand-400 text-black py-2 text-white hover:bg-brand-500 disabled:opacity-50">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-400">
        Already a musician? <Link to="/auth/login" className="text-brand-400 hover:underline">Sign in</Link>
      </p>
    </div>
  );
};
