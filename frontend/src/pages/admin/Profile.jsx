import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PasswordChangeCard from '../../component/PasswordChangeCard';
import { normalizeMultilineForSubmit, normalizeSingleLineForSubmit, sanitizeTextInput } from '../../utils/sanitize';

const Profile = () => {
    const [formData, setFormData] = useState({ name: '', email: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get('/auth/me');
                const user = response.data.user;
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    address: user.address || '',
                });
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Unable to load profile.');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: sanitizeTextInput(value) }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');

        try {
            const payload = {
                name: normalizeSingleLineForSubmit(formData.name),
                address: normalizeMultilineForSubmit(formData.address),
            };
            const response = await api.put('/auth/me', {
                name: payload.name,
                address: payload.address,
            });

            const user = response.data.user;
            setFormData({
                name: user.name || '',
                email: user.email || '',
                address: user.address || '',
            });
            setMessage('Profile updated successfully.');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to update profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="admin-page">
            <div className="page-head">
                <div>
                    <span className="eyebrow">Profile</span>
                    <h1 className="page-title">Update your account details</h1>
                    <p className="subtitle">Email stays locked. You can change your name, address, and password.</p>
                </div>
            </div>

            <div className="page-stack">
                <div className="glass-card page-card page-card-wide">
                    {loading ? (
                        <div className="loader">Loading profile...</div>
                    ) : (
                        <form className="form-grid admin-form-grid" onSubmit={handleSubmit}>
                            <input className="input" name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
                            <input className="input" name="email" value={formData.email} disabled />
                            <textarea className="textarea" name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
                            <button className="btn btn-primary" type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save profile'}
                            </button>
                        </form>
                    )}

                    {error ? <div className="notice error section-gap">{error}</div> : null}
                    {message ? <div className="notice success section-gap">{message}</div> : null}
                </div>

                <PasswordChangeCard />
            </div>
        </section>
    );
};

export default Profile;