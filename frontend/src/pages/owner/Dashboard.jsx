import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import PasswordChangeCard from '../../component/PasswordChangeCard';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { logout, user } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadRatings = async () => {
            try {
                const response = await api.get('/ratings/store');
                setRatings(response.data.ratings || []);
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Unable to load store ratings.');
            } finally {
                setLoading(false);
            }
        };

        loadRatings();
    }, []);

    const averageRating = useMemo(() => {
        if (!ratings.length) {
            return null;
        }

        const total = ratings.reduce((sum, rating) => sum + rating.value, 0);
        return total / ratings.length;
    }, [ratings]);

    return (
        <div className="app-shell">
            <div className="topbar">
                <div>
                    <span className="eyebrow">Store owner</span>
                    <h1 className="title" style={{ margin: '8px 0 0', fontSize: '2rem' }}>Store rating dashboard</h1>
                </div>
                <button className="btn btn-secondary" type="button" onClick={logout}>Logout</button>
            </div>

            <div className="hero-grid">
                <section className="glass-card page-card">
                    <div className="stack">
                        <span className="pill">Owner role: {user?.role}</span>
                        <span className="pill rating-chip">Average rating: {averageRating ? averageRating.toFixed(2) : 'N/A'}</span>
                        <span className="pill success-chip">Rating count: {ratings.length}</span>
                    </div>

                    <div className="table-wrap section-gap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="3">Loading ratings...</td>
                                    </tr>
                                ) : null}
                                {error ? (
                                    <tr>
                                        <td colSpan="3">{error}</td>
                                    </tr>
                                ) : null}
                                {!loading && !error && ratings.length === 0 ? (
                                    <tr>
                                        <td colSpan="3">No ratings yet.</td>
                                    </tr>
                                ) : null}
                                {ratings.map((rating) => (
                                    <tr key={rating.id}>
                                        <td>{rating.User?.name}</td>
                                        <td>{rating.User?.email}</td>
                                        <td>{rating.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="glass-card page-card">
                    <span className="eyebrow">Profile</span>
                    <h2 className="title" style={{ fontSize: '1.9rem' }}>Signed in as store owner</h2>
                    <p className="subtitle">
                        View the people rating your store and rotate your password when needed.
                    </p>
                    <PasswordChangeCard />
                </section>
            </div>
        </div>
    );
};

export default Dashboard;