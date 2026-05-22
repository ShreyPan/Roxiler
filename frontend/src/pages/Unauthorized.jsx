import { Link } from 'react-router-dom';

const Unauthorized = () => (
    <div className="auth-shell">
        <div className="glass-card auth-card">
            <span className="auth-brand danger-chip">403 Access denied</span>
            <h1 className="title">You do not have access to this page.</h1>
            <p className="subtitle">Use an account with the correct role, or return to the login page.</p>
            <div className="auth-actions section-gap">
                <Link className="btn btn-primary" to="/login">
                    Back to login
                </Link>
            </div>
        </div>
    </div>
);

export default Unauthorized;