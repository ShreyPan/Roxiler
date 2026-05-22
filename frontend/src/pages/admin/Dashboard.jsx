import { useEffect, useState } from 'react';
import api from '../../api/axios';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await api.get('/users/stats');
                setStats(response.data);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    return (
        <section className="admin-page">
            <div className="page-head">
                <div>
                    <span className="eyebrow">Admin console</span>
                    <h1 className="page-title">System overview</h1>
                    <p className="subtitle">Track users, stores, and submitted ratings from one place.</p>
                </div>
            </div>

            <div className="glass-card page-card-wide dashboard-hero">
                <div>
                    <span className="eyebrow">Welcome back</span>
                    <h2 className="page-title" style={{ fontSize: '2rem', marginTop: '12px' }}>
                        Keep the platform organized from one place.
                    </h2>
                    <p className="subtitle">
                        Review live counts and switch between the admin sections from the sidebar.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="glass-card page-card-wide loader">Loading stats...</div>
            ) : (
                <div className="grid-cards full-width-stats">
                    <div className="stat-card">
                        <h3>Total users</h3>
                        <div className="stat-value">{stats.totalUsers}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Total stores</h3>
                        <div className="stat-value">{stats.totalStores}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Total ratings</h3>
                        <div className="stat-value">{stats.totalRatings}</div>
                    </div>
                </div>
            )}

        </section>
    );
};

export default Dashboard;