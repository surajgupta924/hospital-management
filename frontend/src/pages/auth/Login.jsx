import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getErrorMessage } from '../../utils/helpers';
import { isProductionMisconfigured } from '../../api/config';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const misconfigured = isProductionMisconfigured();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      const message = getErrorMessage(error);
      if (message.toLowerCase().includes('route not found')) {
        toast.error('API URL is wrong. Set VITE_API_URL on Vercel to your Render backend /api/v1');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 items-center justify-center p-12">
        <div className="text-white max-w-md">
          <Activity className="h-16 w-16 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Hospital Management SaaS</h1>
          <p className="text-primary-100 text-lg">Streamline your hospital operations with our comprehensive multi-tenant platform.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h2>
          <p className="text-gray-500 mb-8">Enter your credentials to access your account</p>
          {misconfigured && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              VITE_API_URL is missing on Vercel. Add your Render URL and redeploy the frontend.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">Forgot password?</Link>
            </div>
            <Button type="submit" loading={loading} className="w-full">Sign In</Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Register hospital</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
