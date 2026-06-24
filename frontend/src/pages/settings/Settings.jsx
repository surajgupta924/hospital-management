import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { hospitalAPI } from '../../api/services';
import { getErrorMessage } from '../../utils/helpers';

const Settings = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [settings, setSettings] = useState({ timezone: 'UTC', currency: 'USD', appointmentDuration: 30 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.hospital) {
      hospitalAPI.getById(user.hospital._id || user.hospital).then(({ data }) => {
        const h = data.data;
        setForm({ name: h.name, email: h.email, phone: h.phone });
        setSettings(h.settings || settings);
      });
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hospitalId = user.hospital._id || user.hospital;
      await hospitalAPI.update(hospitalId, form);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hospitalId = user.hospital._id || user.hospital;
      await hospitalAPI.updateSettings(hospitalId, settings);
      toast.success('Settings updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Settings" subtitle="Hospital profile and configuration" />
      <div className="p-6 space-y-6 max-w-2xl">
        <Card title="Hospital Profile">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input label="Hospital Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Button type="submit" loading={loading}>Save Profile</Button>
          </form>
        </Card>
        <Card title="Hospital Settings">
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <Input label="Timezone" value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
            <Input label="Currency" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
            <Input label="Appointment Duration (min)" type="number" value={settings.appointmentDuration} onChange={(e) => setSettings({ ...settings, appointmentDuration: Number(e.target.value) })} />
            <Button type="submit" loading={loading}>Save Settings</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
