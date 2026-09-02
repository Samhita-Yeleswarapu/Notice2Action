export default function TextInput({ value, onChange }) {
  return (
    <textarea
      id="noticeText"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste the full notice text here — scholarship circulars, exam notices, internship calls, fee reminders, event announcements…"
    />
  );
}
