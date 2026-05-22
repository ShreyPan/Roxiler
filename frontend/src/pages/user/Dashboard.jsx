import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await api.get('/stores?sortBy=id&order=asc');
                setStores(response.data || []);
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Unable to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const stats = useMemo(() => {
        const ratedStores = stores.filter((store) => store.userRating !== null && store.userRating !== undefined);
        const averageRating = stores.length
            ? stores.reduce((sum, store) => sum + Number(store.averageRating || 0), 0) / stores.length
            : 0;

        return {
            totalStores: stores.length,
            ratedStores: ratedStores.length,
            averageRating,
        };
    }, [stores]);

    return (
        <section className="admin-page">
            <div className="page-head">
                <div>
                    <span className="eyebrow">User dashboard</span>
                    <h1 className="page-title">Welcome, {user?.name || 'user'}</h1>
                    <p className="page-subtitle">Track your activity, review store ratings, and jump into the store list or profile from the sidebar.</p>
                </div>
                <Link className="btn btn-primary" to="/user/stores">Browse stores</Link>
            </div>

            <div className="full-width-stats">
                <div className="stat-card">
                    <h3>Stores available</h3>
                    <div className="stat-value">{loading ? '...' : stats.totalStores}</div>
                </div>
                <div className="stat-card">
                    <h3>You rated</h3>
                    <div className="stat-value">{loading ? '...' : stats.ratedStores}</div>
                </div>
                <div className="stat-card">
                    <h3>Average rating</h3>
                    <div className="stat-value">{loading ? '...' : stats.averageRating.toFixed(2)}</div>
                </div>
            </div>

            <div className="glass-card page-card page-card-wide">
                <span className="eyebrow">Quick overview</span>
                <h2 className="title" style={{ fontSize: '1.8rem' }}>Recent store activity</h2>
                <p className="subtitle">The dashboard stays clean on purpose. Use it for a summary, then move to Stores for rating actions.</p>

                {error ? <div className="notice error section-gap">{error}</div> : null}

                {loading ? (
                    <div className="loader section-gap">Loading dashboard...</div>
                ) : (
                    <div className="grid-cards section-gap">
                        {stores.slice(0, 3).map((store) => (
                            <article className="list-card" key={store.id}>
                                <h3>{store.name}</h3>
                                <p className="muted">{store.address}</p>
                                <div className="stack section-gap">
                                    <span className="pill rating-chip">Overall {store.averageRating ? Number(store.averageRating).toFixed(2) : 'N/A'}</span>
                                    <span className="pill">Your rating: {store.userRating ?? 'Not rated'}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Dashboard;