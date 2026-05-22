import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { sanitizeSearchInput } from '../../utils/sanitize';

const ratingOptions = [1, 2, 3, 4, 5];

const compareValues = (a, b, order) => {
    const direction = order === 'desc' ? -1 : 1;
    if (a === b) {
        return 0;
    }

    return a > b ? direction : -direction;
};

const Stores = () => {
    const [stores, setStores] = useState([]);
    const [query, setQuery] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [order, setOrder] = useState('asc');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(null);

    useEffect(() => {
        const loadStores = async () => {
            try {
                const response = await api.get('/stores?sortBy=id&order=asc');
                setStores(response.data);
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Unable to load stores.');
            } finally {
                setLoading(false);
            }
        };

        loadStores();
    }, []);

    const filteredStores = useMemo(() => {
        const search = query.toLowerCase();
        return [...stores]
            .filter((store) => {
                const haystack = [store.name, store.email, store.address]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(search);
            })
            .sort((left, right) => compareValues(String(left[sortBy] ?? '').toLowerCase(), String(right[sortBy] ?? '').toLowerCase(), order));
    }, [stores, query, sortBy, order]);

    const handleRating = async (store, value) => {
        setSubmitting(store.id);
        setError('');
        setMessage('');

        try {
            const payload = { store_id: store.id, value };
            const endpoint = store.userRating ? '/ratings' : '/ratings';
            const method = store.userRating ? 'put' : 'post';
            await api[method](endpoint, payload);
            setMessage(store.userRating ? 'Rating updated.' : 'Rating submitted.');

            const response = await api.get('/stores?sortBy=id&order=asc');
            setStores(response.data);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to submit rating.');
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <section className="admin-page">
            <div className="page-head">
                <div>
                    <span className="eyebrow">User store list</span>
                    <h1 className="page-title">Search, rate, and update store ratings</h1>
                    <p className="page-subtitle">Use the filters to find stores, then rate them from the cards below.</p>
                </div>
            </div>

            <div className="glass-card page-card page-card-wide">
                <div className="toolbar">
                    <input className="input" placeholder="Search by store name or address" value={query} onChange={(e) => setQuery(sanitizeSearchInput(e.target.value))} />
                    <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="name">Sort by name</option>
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

                <div className="grid-cards section-gap">
                    {!loading && filteredStores.map((store) => (
                        <article className="list-card" key={store.id}>
                            <div className="stack" style={{ justifyContent: 'space-between' }}>
                                <div>
                                    <h3>{store.name}</h3>
                                    <p className="muted">{store.email}</p>
                                    <p className="muted">{store.address}</p>
                                </div>
                                <div className="pill rating-chip">Overall {store.averageRating ? Number(store.averageRating).toFixed(2) : 'N/A'}</div>
                            </div>

                            <div className="divider" />

                            <div className="stack">
                                <span className="pill">Your rating: {store.userRating ?? 'Not rated'}</span>
                            </div>

                            <div className="stack section-gap">
                                {ratingOptions.map((value) => (
                                    <button
                                        key={value}
                                        className={`btn ${store.userRating === value ? 'btn-primary' : 'btn-secondary'}`}
                                        type="button"
                                        onClick={() => handleRating(store, value)}
                                        disabled={submitting === store.id}
                                    >
                                        {submitting === store.id && store.userRating !== value ? 'Saving...' : `${value}`}
                                    </button>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stores;