import { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';

export default function PDFUploader({ file, onFileSelected, onFileRemoved }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function pickFile(f) {
    if (!f) return;
    onFileSelected(f);
  }

  return (
    <div
      className={`dropzone ${dragging ? 'drag' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files?.[0]) pickFile(e.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={(e) => {
          if (e.target.files?.[0]) pickFile(e.target.files[0]);
        }}
      />
      <div className="dz-title">
        <Paperclip size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
        Drop a PDF here, or click to upload
      </div>
      <div className="dz-sub">The backend extracts the text — your file is never stored permanently.</div>

      {file && (
        <div className="file-chip" onClick={(e) => e.stopPropagation()}>
          <span>
            📄 {file.name} ({(file.size / 1024).toFixed(0)} KB)
          </span>
          <button
            title="Remove file"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = '';
              onFileRemoved();
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
