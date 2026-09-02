import { useRef, useState } from 'react';
import { askNotice as askNoticeApi } from '../services/api.js';

export default function AskNotice({ noticeId }) {
  const [messages, setMessages] = useState([]); // { role: 'user' | 'assistant', content }
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const logRef = useRef(null);

  async function handleAsk() {
    const q = question.trim();
    if (!q || asking) return;
    setQuestion('');
    const nextMessages = [...messages, { role: 'user', content: q }];
    setMessages(nextMessages);
    setAsking(true);
    try {
      const answer = await askNoticeApi(noticeId, q, messages);
      setMessages([...nextMessages, { role: 'assistant', content: answer }]);
    } catch (err) {
      setMessages([...nextMessages, { role: 'assistant', content: "Sorry, I couldn't process that question — please try again." }]);
    } finally {
      setAsking(false);
      requestAnimationFrame(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      });
    }
  }

  return (
    <div className="section-card ask-card">
      <div className="s-label">Ask the notice</div>
      <div className="chat-log" ref={logRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role === 'user' ? 'user' : 'bot'}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="ask-row">
        <input
          type="text"
          placeholder="e.g. What happens if I miss the deadline?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAsk();
          }}
        />
        <button onClick={handleAsk} disabled={asking}>
          Ask
        </button>
      </div>
      <div className="ask-hint">Answers are generated from this notice's text only.</div>
    </div>
  );
}
