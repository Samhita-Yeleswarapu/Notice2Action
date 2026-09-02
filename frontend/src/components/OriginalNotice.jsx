import { useState } from 'react';

export default function OriginalNotice({ text, pdfUrl }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <button className="raw-toggle" onClick={() => setShow((s) => !s)}>
        {show ? 'Hide original notice text' : 'View original notice text'}
      </button>
      {pdfUrl && (
        <a
          className="raw-toggle"
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginLeft: 16 }}
        >
          View original PDF
        </a>
      )}
      <div className={`raw-text ${show ? 'show' : ''}`}>{text}</div>
    </>
  );
}
