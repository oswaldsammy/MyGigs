import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPassword } from '../services/auth';
import { useToast } from '../contexts/ToastContext';

interface Form { email: string; password: string }

export const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (v: Form) => {
    setLoading(true);
    try {
      await signInWithPassword(v.email, v.password);
      navigate('/');
    } catch (e) {
      toast('error', (e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-xl bg-elev p-8 shadow">
      <h1 className="mb-6 text-2xl font-bold">Sign in to MyGigs</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" className="w-full rounded-lg border px-3 py-2"
            {...register('email', { required: 'Email required' })} />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input type="password" className="w-full rounded-lg border px-3 py-2"
            {...register('password', { required: 'Password required' })} />
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>
        <button disabled={loading} type="submit"
          className="w-full rounded-lg bg-brand-400 text-black py-2 text-white hover:bg-brand-500 disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-400">
        New to MyGigs? <Link to="/auth/signup" className="text-brand-400 hover:underline">Create an account</Link>
      </p>
    </div>
  );
};
