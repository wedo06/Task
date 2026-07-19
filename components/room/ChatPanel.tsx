import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import styles from './ChatPanel.module.css';

interface Props {
  roomId: string;
  currentMemberId: string;
  currentMemberName: string;
}

function stringToColor(str: string): string {
  const colors = ['#ff2d78', '#00e5ff', '#00b4ff', '#00e5a0', '#f5e642', '#ff6b35'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function ChatPanel({ roomId, currentMemberId, currentMemberName }: Props) {
  const { messages, loading, sendMessage } = useChat(roomId);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(currentMemberId, currentMemberName, text);
    setText('');
  };

  if (loading) {
    return <div className={styles.loading}>Loading chat...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.messages} ref={scrollRef}>
        {messages.length === 0 && (
          <div className={styles.empty}>No messages yet. Start the conversation!</div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.memberId === currentMemberId;
          const showHeader = i === 0 || messages[i - 1].memberId !== msg.memberId;
          
          return (
            <div key={msg.id} className={`${styles.messageWrapper} ${isMe ? styles.messageMe : ''}`}>
              {!isMe && showHeader && (
                <div className={styles.messageAvatar} style={{ background: stringToColor(msg.memberName) }}>
                  {msg.memberName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={styles.messageContent}>
                {!isMe && showHeader && <div className={styles.messageName}>{msg.memberName}</div>}
                <div className={`${styles.messageBubble} ${isMe ? styles.bubbleMe : styles.bubbleThem}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form className={styles.inputArea} onSubmit={handleSubmit}>
        <input
          type="text"
          className={`input-candy ${styles.input}`}
          placeholder="Say something..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className={`btn btn-primary ${styles.sendBtn}`} disabled={!text.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
