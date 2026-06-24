import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/services';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getErrorMessage } from '../../utils/helpers';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent if email exists');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md card">
        <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
        <p className="text-gray-500 mb-6">Enter your email to receive a reset link</p>
        {sent ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">Check your email for reset instructions.</p>
            <Link to="/login" className="text-primary-600 font-medium">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
