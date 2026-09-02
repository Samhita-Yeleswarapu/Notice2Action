const STEPS = ['Reading notice', 'Extracting information', 'Analysing with AI', 'Organising results', 'Saving action plan'];

// activeIndex: which step is currently in progress (-1 = idle/not shown)
export default function ProcessingStatus({ activeIndex }) {
  if (activeIndex < 0) return null;

  return (
    <div className="processing-steps">
      {STEPS.map((label, i) => (
        <div key={label} className={`processing-step ${i < activeIndex ? 'done' : ''} ${i === activeIndex ? 'active' : ''}`}>
          {i < activeIndex ? '✓' : i === activeIndex ? '›' : '·'} {label}
        </div>
      ))}
    </div>
  );
}
