import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import {
    normalizeMultilineForSubmit,
    normalizeSingleLineForSubmit,
    sanitizeEmailInput,
    sanitizeSearchInput,
    sanitizeTextInput,
} from '../../utils/sanitize';

const emptyForm = {
    name: '',
    email: '',
    address: '',
    owner_id: '',
};

const compareValues = (a, b, order) => {
    const direction = order === 'desc' ? -1 : 1;
    if (a === b) {
        return 0;
    }

    return a > b ? direction : -direction;
};

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [owners, setOwners] = useState([]);
    const [query, setQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [order, setOrder] = useState('asc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState(emptyForm);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [storesResponse, usersResponse] = await Promise.all([
                    api.get('/stores?sortBy=id&order=asc'),
                    api.get('/users?sortBy=id&order=asc'),
                ]);

                setStores(storesResponse.data);
                setOwners(usersResponse.data.filter((user) => user.role === 'store_owner'));
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Unable to load stores.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const ownerMap = useMemo(() => new Map(owners.map((owner) => [owner.id, owner])), [owners]);

    const filteredStores = useMemo(() => {
        const search = query.toLowerCase();
        return [...stores]
            .filter((store) => {
                const owner = ownerMap.get(store.owner_id);
                const haystack = [store.name, store.email, store.address, owner?.name, owner?.email]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(search);
            })
            .sort((left, right) => compareValues(String(left[sortBy] ?? '').toLowerCase(), String(right[sortBy] ?? '').toLowerCase(), order));
    }, [stores, query, sortBy, order, ownerMap]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        const sanitizerByField = {
            name: sanitizeTextInput,
            email: sanitizeEmailInput,
            address: sanitizeTextInput,
            owner_id: (inputValue) => inputValue,
        };
        const nextValue = sanitizerByField[name](value);
        setFormData((current) => ({ ...current, [name]: nextValue }));
    };

    const handleAddStore = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        try {
            const payload = {
                name: normalizeSingleLineForSubmit(formData.name),
                email: sanitizeEmailInput(formData.email),
                address: normalizeMultilineForSubmit(formData.address),
                owner_id: formData.owner_id,
            };
            await api.post('/stores', payload);
            setMessage('Store created successfully.');
            setFormData(emptyForm);

            const response = await api.get('/stores?sortBy=id&order=asc');
            setStores(response.data);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to create store.');
        }
    };

    return (
        <section className="admin-page">
            <div className="page-head">
                <div>
                    <span className="eyebrow">Admin stores</span>
                    <h1 className="page-title">Store management</h1>
                    <p className="subtitle">See all stores, linked owners, and average ratings.</p>
                </div>
            </div>

            <div className="page-stack">
                <div className="glass-card page-card page-card-wide">
                    <div className="toolbar">
                        <input className="input" placeholder="Search by name, email, address, owner" value={query} onChange={(e) => setQuery(sanitizeSearchInput(e.target.value))} />
                        <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="name">Sort by name</option>
                            <option value="email">Sort by email</option>
                            <option value="address">Sort by address</option>
                            <option value="averageRating">Sort by rating</option>
                        </select>
                        <select className="select" value={order} onChange={(e) => setOrder(e.target.value)}>
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>

                    {loading ? <div className="loader">Loading stores...</div> : null}
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
                                        <th>Owner</th>
                                        <th>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStores.map((store) => {
                                        const owner = ownerMap.get(store.owner_id);

                                        return (
                                            <tr key={store.id}>
                                                <td>{store.name}</td>
                                                <td>{store.email}</td>
                                                <td>{store.address}</td>
                                                <td>{owner ? `${owner.name} (${owner.email})` : `Owner #${store.owner_id}`}</td>
                                                <td>{store.averageRating ? Number(store.averageRating).toFixed(2) : 'No ratings yet'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : null}
                </div>

                <div className="glass-card page-card page-card-wide">
                    <span className="eyebrow">Add store</span>
                    <h2 className="page-subtitle">Register stores to existing owners</h2>
                    <form className="form-grid admin-form-grid" onSubmit={handleAddStore}>
                        <input className="input" name="name" placeholder="Store name" value={formData.name} onChange={handleChange} required />
                        <input className="input" type="email" name="email" placeholder="Store email" value={formData.email} onChange={handleChange} required />
                        <textarea className="textarea" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                        <select className="select" name="owner_id" value={formData.owner_id} onChange={handleChange} required>
                            <option value="">Select store owner</option>
                            {owners.map((owner) => (
                                <option key={owner.id} value={owner.id}>{owner.name}</option>
                            ))}
                        </select>
                        <button className="btn btn-primary" type="submit">Add store</button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Stores;