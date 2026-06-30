import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { getErrorMessage } from '../../utils/helpers';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '',
    hospitalName: '', hospitalSlug: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'hospitalName') {
        updated.hospitalSlug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        hospitalName: form.hospitalName.trim(),
        hospitalSlug: form.hospitalSlug.trim(),
      };
      await register(payload);
      toast.success('Hospital registered successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-lg card">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Register Your Hospital</h2>
        <p className="text-gray-500 mb-6">Create your hospital account on HMS SaaS</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required />
            <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required />
          </div>
          <Input label="Hospital Name" name="hospitalName" value={form.hospitalName} onChange={handleChange} required />
          <Input label="Hospital Slug" name="hospitalSlug" value={form.hospitalSlug} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          <p className="text-xs text-gray-500">
            Password must be at least 8 characters with uppercase, lowercase, and a number (e.g. Admin@12345).
          </p>
          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
