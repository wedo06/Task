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
  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const { messages, channels, loading, sendMessage, createChannel, renameChannel } = useChat(roomId, activeChannelId);
  const [text, setText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If active channel gets deleted or doesn't exist initially, default to general
    if (channels.length > 0 && !channels.find(c => c.id === activeChannelId)) {
      setActiveChannelId('general');
    }
  }, [channels, activeChannelId]);

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

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    const id = await createChannel(newChannelName);
    if (id) {
      setActiveChannelId(id);
      setIsCreating(false);
      setNewChannelName('');
    }
  };

  const handleRename = () => {
    const channel = channels.find(c => c.id === activeChannelId);
    if (!channel) return;
    const newName = prompt('Rename channel:', channel.name);
    if (newName && newName.trim()) {
      renameChannel(activeChannelId, newName.trim());
    }
  };

  if (loading && channels.length === 0) {
    return <div className={styles.loading}>Loading chat...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Channel Header */}
      <div className={styles.channelHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: 4 }}>
          {channels.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveChannelId(c.id)}
              className={`${styles.channelTab} ${activeChannelId === c.id ? styles.channelTabActive : ''}`}
            >
              #{c.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={styles.iconBtn} onClick={() => setIsCreating(!isCreating)} title="New Channel">
            +
          </button>
          <button className={styles.iconBtn} onClick={handleRename} title="Rename Channel" disabled={activeChannelId === 'general'}>
            ✎
          </button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateChannel} className={styles.createChannelForm}>
          <input
            type="text"
            placeholder="Channel name..."
            className={`input-candy ${styles.channelInput}`}
            value={newChannelName}
            onChange={e => setNewChannelName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn btn-primary btn-sm">Create</button>
        </form>
      )}

      <div className={styles.messages} ref={scrollRef}>
        {messages.length === 0 && !loading && (
          <div className={styles.empty}>No messages in #{channels.find(c => c.id === activeChannelId)?.name}. Start the conversation!</div>
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
          placeholder={`Message #${channels.find(c => c.id === activeChannelId)?.name || 'general'}...`}
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
