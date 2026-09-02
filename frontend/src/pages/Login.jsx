import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header.jsx';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/auth/login`, { email, password });
      localStorage.setItem('n2a_token', data.token);
      navigate('/app');
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="stage" style={{ gridTemplateColumns: '1fr', maxWidth: 420 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'Newsreader,serif', marginTop: 0 }}>Log in</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
            />
            {error && <div className="error-note">{error}</div>}
            <button className="analyse-btn" disabled={loading} type="submit">
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
          <p style={{ fontSize: 13, marginTop: 14 }}>
            No account? <a href="/register">Register</a>
          </p>
        </div>
      </div>
    </>
  );
}
