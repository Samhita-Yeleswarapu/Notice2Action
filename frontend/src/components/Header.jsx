import { Link } from 'react-router-dom';

export default function Header({ rightSlot }) {
  return (
    <header className="top">
      <Link to="/" className="logo">
        <div className="mark">N2A</div>
        <h1>Notice2Action</h1>
        <span className="tag"></span>
      </Link>
      <nav className="top-actions">
        <span className="tag" style={{ display: 'inline-flex', borderLeft: 'none', paddingLeft: 0 }}>
          Powered by Claude
        </span>
        {rightSlot}
      </nav>
    </header>
  );
}