import { useState } from 'react';
import api from '../../api/axios';
import {
    normalizeMultilineForSubmit,
    normalizeSingleLineForSubmit,
    sanitizeEmailInput,
    sanitizePasswordInput,
    sanitizeTextInput,
} from '../../utils/sanitize';

const initialForm = {
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'normal',
};

const AddAccount = () => {
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        const sanitizerByField = {
            name: sanitizeTextInput,
            email: sanitizeEmailInput,
            address: sanitizeTextInput,
            password: sanitizePasswordInput,
            role: (inputValue) => inputValue,
        };
        const nextValue = sanitizerByField[name](value);
        setFormData((current) => ({ ...current, [name]: nextValue }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const payload = {
                name: normalizeSingleLineForSubmit(formData.name),
                email: sanitizeEmailInput(formData.email),
                address: normalizeMultilineForSubmit(formData.address),
                password: formData.password,
                role: formData.role,
            };
            await api.post('/users', payload);
            setMessage('Account created successfully.');
            setFormData(initialForm);
        } catch (requestError) {
            const validationErrors = requestError.response?.data?.errors;
            if (Array.isArray(validationErrors)) {
                setError(validationErrors.map((item) => item.msg).join(' '));
            } else {
                setError(requestError.response?.data?.message || 'Unable to create account.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="admin-page">
            <div className="page-head">
                <div>
                    <span className="eyebrow">Add account</span>
                    <h1 className="page-title">Create users, admins, and store owners</h1>
                    <p className="subtitle">Use this page to create a new account without changing the email later.</p>
                </div>
            </div>

            <div className="glass-card page-card page-card-wide">
                <form className="form-grid admin-form-grid" onSubmit={handleSubmit}>
                    <input className="input" name="name" placeholder="Name" value={formData.name} onChange={handleChange} minLength={20} maxLength={60} required />
                    <input className="input" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    <textarea className="textarea" name="address" placeholder="Address" value={formData.address} onChange={handleChange} maxLength={400} required />
                    <input className="input" type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} minLength={8} maxLength={16} required />
                    <select className="select" name="role" value={formData.role} onChange={handleChange}>
                        <option value="normal">Normal user</option>
                        <option value="admin">Admin</option>
                        <option value="store_owner">Store owner</option>
                    </select>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create account'}
                    </button>
                </form>

                {error ? <div className="notice error section-gap">{error}</div> : null}
                {message ? <div className="notice success section-gap">{message}</div> : null}
            </div>
        </section>
    );
};

export default AddAccount;