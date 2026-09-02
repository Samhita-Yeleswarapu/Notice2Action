import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header.jsx';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${baseURL}/auth/register`, { name, email, password });
      localStorage.setItem('n2a_token', data.token);
      navigate('/app');
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="stage" style={{ gridTemplateColumns: '1fr', maxWidth: 420 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'Newsreader,serif', marginTop: 0 }}>Create an account</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
            />
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
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
            />
            {error && <div className="error-note">{error}</div>}
            <button className="analyse-btn" disabled={loading} type="submit">
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>
          <p style={{ fontSize: 13, marginTop: 14 }}>
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </>
  );
}
