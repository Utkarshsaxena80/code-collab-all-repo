'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './ChatPanel.module.css';

export default function ChatPanel({ userName, room }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!room) return;

    // Use the same base URL but append /chat for the chat websocket
    // In local dev, you might connect to ws://localhost:8080/chat
    // For Render, it's wss://code-collab-all-repo.onrender.com/chat
    // We can infer it from the environment if needed, or hardcode like the editor does.
    const wsUrl = "wss://code-collab-all-repo.onrender.com/chat";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to chat websocket");
      ws.send(JSON.stringify({
        type: "JOIN_ROOM",
        room: room,
        userName: userName
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "CHAT_MESSAGE") {
          setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            userName: data.userName,
            text: data.text,
            timestamp: data.timestamp,
            isMe: data.userName === userName
          }]);
        }
      } catch (err) {
        console.error("Chat WebSocket parse error:", err);
      }
    };

    ws.onclose = () => {
      console.log("Chat WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, [room, userName]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
      type: "CHAT_MESSAGE",
      room: room,
      userName: userName,
      text: inputText.trim(),
      timestamp: new Date().toISOString()
    }));

    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        Room Chat
      </div>
      
      <div className={styles.messagesArea}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>No messages yet. Say hi!</div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${styles.messageWrapper} ${msg.isMe ? styles.myMessage : styles.otherMessage}`}
            >
              {!msg.isMe && <div className={styles.senderName}>{msg.userName}</div>}
              <div className={styles.messageBubble}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <textarea
          className={styles.chatInput}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
        />
        <button 
          className={styles.sendButton} 
          onClick={handleSend}
          disabled={!inputText.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
