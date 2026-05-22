import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { sanitizeEmailInput, sanitizePasswordInput } from '../utils/sanitize';

const getDashboardRoute = (role) => {
    if (role === 'admin') {
        return '/admin/dashboard';
    }

    if (role === 'store_owner') {
        return '/owner/dashboard';
    }

    return '/user/dashboard';
};

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        const nextValue = name === 'email' ? sanitizeEmailInput(value) : sanitizePasswordInput(value);
        setFormData((current) => ({ ...current, [name]: nextValue }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                email: sanitizeEmailInput(formData.email),
                password: formData.password,
            };
            const response = await api.post('/auth/login', payload);
            login(response.data.token);
            const tokenPayload = JSON.parse(atob(response.data.token.split('.')[1]));
            navigate(getDashboardRoute(tokenPayload.role), { replace: true });
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to sign in.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <div className="auth-hero">
                <span className="auth-brand">Ratings Platform</span>
                <h1 className="auth-title">Single sign-in for admin, users, and store owners.</h1>
                <p className="auth-subtitle">
                    Access the correct dashboard based on role after a single JWT login.
                </p>
            </div>

            <div className="glass-card auth-card">
                <form className="form-grid section-gap" onSubmit={handleSubmit}>
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
                        <span className="field-label">Password</span>
                        <input
                            className="input"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                {error ? <div className="notice error section-gap">{error}</div> : null}

                <div className="auth-actions">
                    <span className="muted">New here? </span>
                    <Link className="muted-link" to="/register">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;