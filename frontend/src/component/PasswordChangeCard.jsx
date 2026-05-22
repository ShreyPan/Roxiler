import { useState } from 'react';
import api from '../api/axios';
import { sanitizePasswordInput } from '../utils/sanitize';

const initialState = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
};

const PasswordChangeCard = ({ onUpdated }) => {
    const [formData, setFormData] = useState(initialState);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: sanitizePasswordInput(value) }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            };

            const response = await api.put('/auth/password', payload);
            setMessage(response.data?.message || 'Password updated successfully.');
            setFormData(initialState);

            if (onUpdated) {
                onUpdated();
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="panel-card section-gap">
            <h3>Update password</h3>
            <p className="muted compact">Use this after login to rotate your credentials without leaving the app.</p>
            <form className="form-grid section-gap" onSubmit={handleSubmit}>
                <input
                    className="input"
                    name="oldPassword"
                    type="password"
                    placeholder="Current password"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    required
                />
                <input
                    className="input"
                    name="newPassword"
                    type="password"
                    placeholder="New password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                />
                <input
                    className="input"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Update password'}
                </button>
            </form>
            {error ? <div className="notice error section-gap">{error}</div> : null}
            {message ? <div className="notice success section-gap">{message}</div> : null}
        </div>
    );
};

export default PasswordChangeCard;