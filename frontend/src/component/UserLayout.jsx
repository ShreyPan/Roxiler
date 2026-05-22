import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/user/dashboard', label: 'Dashboard' },
    { to: '/user/stores', label: 'Stores' },
    { to: '/user/profile', label: 'Profile' },
];

const UserLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleNavigate = () => {
        if (window.innerWidth < 1080) {
            setMobileOpen(false);
        }
    };

    return (
        <div className={`admin-shell ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            <header className="admin-navbar">
                <div className="nav-left">
                    <button
                        className="sidebar-toggle"
                        type="button"
                        onClick={() => {
                            setMobileOpen((current) => !current);
                            setCollapsed(false);
                        }}
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                    <div className="nav-brand">
                        <strong>Ratings</strong>
                        <span>User console</span>
                    </div>
                </div>

                <div className="nav-right">
                    <span className="nav-role">{user?.role || 'normal'}</span>
                    <button
                        className="collapse-toggle"
                        type="button"
                        onClick={() => setCollapsed((current) => !current)}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? 'Expand' : 'Collapse'}
                    </button>
                </div>
            </header>

            <aside className="admin-sidebar glass-card">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{(user?.name || user?.role || 'U').slice(0, 1).toUpperCase()}</div>
                    <div className="sidebar-user-meta">
                        <span className="sidebar-user-label">Signed in</span>
                        <strong>{user?.name || 'User'}</strong>
                    </div>
                </div>

                <nav className="sidebar-nav" aria-label="User navigation">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={handleNavigate}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="sidebar-link-dot" />
                            <span className="sidebar-link-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button className="btn btn-secondary sidebar-logout" type="button" onClick={logout}>
                    Logout
                </button>
            </aside>

            {mobileOpen ? <button className="sidebar-backdrop" type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} /> : null}

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;