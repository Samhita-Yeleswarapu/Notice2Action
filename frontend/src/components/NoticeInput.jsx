import TextInput from './TextInput.jsx';
import PDFUploader from './PDFUploader.jsx';
import AnalyseButton from './AnalyseButton.jsx';
import ProcessingStatus from './ProcessingStatus.jsx';

export default function NoticeInput({
  text,
  onTextChange,
  file,
  onFileSelected,
  onFileRemoved,
  onAnalyse,
  loading,
  processingStep,
  error,
}) {
  return (
    <div className="board">
      <div className="step-label">① Paste notice / upload PDF</div>
      <TextInput value={text} onChange={onTextChange} />

      <PDFUploader file={file} onFileSelected={onFileSelected} onFileRemoved={onFileRemoved} />

      <AnalyseButton loading={loading} onClick={onAnalyse} disabled={!text.trim() && !file} />

      {loading && <ProcessingStatus activeIndex={processingStep} />}

      {error && <div className="error-note">{error}</div>}
    </div>
  );
}
