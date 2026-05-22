import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { sanitizeSearchInput } from '../../utils/sanitize';

const compareValues = (a, b, order) => {
    const direction = order === 'desc' ? -1 : 1;
    if (a === b) {
        return 0;
    }

    return a > b ? direction : -direction;
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [order, setOrder] = useState('asc');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [roleDrafts, setRoleDrafts] = useState({});

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await api.get('/users?sortBy=id&order=asc');
                const baseUsers = response.data;
                const enrichedUsers = await Promise.all(
                    baseUsers.map(async (item) => {
                        if (item.role !== 'store_owner') {
                            return item;
                        }

                        try {
                            const detailResponse = await api.get(`/users/${item.id}`);
                            return detailResponse.data;
                        } catch (requestError) {
                            return item;
                        }
                    })
                );

                setUsers(enrichedUsers);
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Unable to load users.');
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        const search = query.toLowerCase();
        return [...users]
            .filter((user) => {
                const haystack = [user.name, user.email, user.address, user.role]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(search);
            })
            .sort((left, right) => compareValues(String(left[sortBy] ?? '').toLowerCase(), String(right[sortBy] ?? '').toLowerCase(), order));
    }, [users, query, sortBy, order]);

    const handleRoleChange = (userId, value) => {
        setRoleDrafts((current) => ({ ...current, [userId]: value }));
    };

    const handleUpdateRole = async (userId) => {
        const nextRole = roleDrafts[userId];

        if (!nextRole) {
            return;
        }

        setError('');
        setMessage('');

        try {
            await api.put(`/users/${userId}/role`, { role: nextRole });
            setMessage('User role updated successfully.');

            const response = await api.get('/users?sortBy=id&order=asc');
            setUsers(response.data);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to update user role.');
        }
    };

    return (
        <section className="admin-page">
            <div className="page-head">
                <div>
                    <span className="eyebrow">Admin users</span>
                    <h1 className="page-title">User management</h1>
                    <p className="subtitle">Search users, inspect store owner ratings, and update roles inline.</p>
                </div>
            </div>

            <div className="glass-card page-card page-card-wide">
                <div className="toolbar">
                    <input className="input" placeholder="Search by name, email, address, role" value={query} onChange={(e) => setQuery(sanitizeSearchInput(e.target.value))} />
                    <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="name">Sort by name</option>
                        <option value="email">Sort by email</option>
                        <option value="role">Sort by role</option>
                        <option value="address">Sort by address</option>
                    </select>
                    <select className="select" value={order} onChange={(e) => setOrder(e.target.value)}>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                {loading ? <div className="loader">Loading users...</div> : null}
                {error ? <div className="notice error">{error}</div> : null}
                {message ? <div className="notice success">{message}</div> : null}

                {!loading ? (
                    <div className="table-wrap section-gap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Address</th>
                                    <th>Role</th>
                                    <th>Store rating</th>
                                    <th>Change role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.address}</td>
                                        <td><span className="pill">{user.role}</span></td>
                                        <td>
                                            {user.role === 'store_owner'
                                                ? (user.averageRating ? Number(user.averageRating).toFixed(2) : 'No ratings yet')
                                                : '—'}
                                        </td>
                                        <td>
                                            <div className="stack wrap">
                                                <select
                                                    className="select"
                                                    value={roleDrafts[user.id] || user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                >
                                                    <option value="normal">Normal user</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="store_owner">Store owner</option>
                                                </select>
                                                <button className="btn btn-secondary" type="button" onClick={() => handleUpdateRole(user.id)}>
                                                    Save
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export default Users;