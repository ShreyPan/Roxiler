import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    normalizeMultilineForSubmit,
    normalizeSingleLineForSubmit,
    sanitizeEmailInput,
    sanitizePasswordInput,
    sanitizeTextInput,
} from '../utils/sanitize';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        const nextValue = {
            email: sanitizeEmailInput,
            password: sanitizePasswordInput,
            name: sanitizeTextInput,
            address: sanitizeTextInput,
        }[name](value);
        setFormData((current) => ({ ...current, [name]: nextValue }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                name: normalizeSingleLineForSubmit(formData.name),
                email: sanitizeEmailInput(formData.email),
                address: normalizeMultilineForSubmit(formData.address),
                password: formData.password,
            };
            const response = await api.post('/auth/register', payload);
            setSuccess(response.data?.message || 'Registration complete.');
            setTimeout(() => navigate('/login', { replace: true }), 900);
        } catch (requestError) {
            const validationErrors = requestError.response?.data?.errors;
            if (Array.isArray(validationErrors)) {
                setError(validationErrors.map((item) => item.msg).join(' '));
            } else {
                setError(requestError.response?.data?.message || 'Unable to register.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-hero">
                <span className="auth-brand">Create normal user account</span>
                <h1 className="auth-title">Join the platform and submit store ratings.</h1>
                <p className="auth-subtitle">
                    Registration is for normal users only. Admins and store owners are created from the admin area.
                </p>
            </div>

            <div className="glass-card auth-card">
                <form className="form-grid section-gap" onSubmit={handleSubmit}>
                    <label className="field">
                        <span className="field-label">Full name</span>
                        <input
                            className="input"
                            type="text"
                            name="name"
                            placeholder="Jane Alexandra Smith"
                            value={formData.name}
                            onChange={handleChange}
                            minLength={20}
                            maxLength={60}
                            required
                        />
                    </label>
                    <label className="field">
                        <span className="field-label">Email</span>
                        <input
                            className="input"
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label className="field">
                        <span className="field-label">Address</span>
                        <textarea
                            className="textarea"
                            name="address"
                            placeholder="Street, city, and postal code"
                            value={formData.address}
                            onChange={handleChange}
                            maxLength={400}
                            required
                        />
                    </label>
                    <label className="field">
                        <span className="field-label">Password</span>
                        <input
                            className="input"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            maxLength={16}
                            required
                        />
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                {error ? <div className="notice error section-gap">{error}</div> : null}
                {success ? <div className="notice success section-gap">{success}</div> : null}

                <div className="auth-actions">
                    <span className="muted">Already have an account?</span>
                    <Link className="muted-link" to="/login">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;