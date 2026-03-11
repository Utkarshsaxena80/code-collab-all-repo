'use client';

import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';

const DEFAULT_CODE = `def hello():
    print("Hello world")`;

const cursorColors = [
  '#ff0000', '#00ff00', '#3b82f6', '#d946ef', '#06b6d4', '#eab308', '#f97316'
];

const getColorForUser = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % cursorColors.length;
  return cursorColors[index];
};

export default function CodeEditor({ userName, file, room }) {

  const wsRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef({});
  const isRemoteUpdate = useRef(false);
  
  // Track remote cursors in state to render HTML nametags
  const [remoteCursors, setRemoteCursors] = useState({});

  const code =
    file?.content !== undefined && file?.content !== null
      ? file.content
      : DEFAULT_CODE;

  // Update cursor positions when the editor scrolls or resizes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const updateCursorPositions = () => {
      setRemoteCursors(prev => {
        const updated = { ...prev };
        let changed = false;
        
        Object.keys(updated).forEach(user => {
          const cursor = updated[user];
          const pos = editor.getScrolledVisiblePosition({
            lineNumber: cursor.lineNumber,
            column: cursor.column
          });
          
          if (pos && (pos.top !== cursor.top || pos.left !== cursor.left)) {
            updated[user] = { ...cursor, top: pos.top, left: pos.left };
            changed = true;
          } else if (!pos && cursor.visible) {
            updated[user] = { ...cursor, visible: false };
            changed = true;
          } else if (pos && !cursor.visible) {
            updated[user] = { ...cursor, visible: true, top: pos.top, left: pos.left };
            changed = true;
          }
        });
        
        return changed ? updated : prev;
      });
    };

    const disp1 = editor.onDidScrollChange(updateCursorPositions);
    const disp2 = editor.onDidLayoutChange(updateCursorPositions);
    
    return () => {
      disp1.dispose();
      disp2.dispose();
    };
  }, []);

  useEffect(() => {

    if (!room) return;

    const ws = new WebSocket("wss://code-collab-all-repo.onrender.com");
    wsRef.current = ws;

    ws.onopen = () => {

      console.log("Connected to websocket");

      ws.send(JSON.stringify({
        type: "JOIN_ROOM",
        room: room,
        userName: userName
      }));

      ws.send(JSON.stringify({
        type: "INIT_FILE",
        room: room,
        language: "python",
        content: code
      }));

    };

    ws.onmessage = (event) => {

      try {

        const data = JSON.parse(event.data);

        if (data.type === "ROOM_STATE") {

          const editor = editorRef.current;
          if (!editor) return;

          isRemoteUpdate.current = true;
          editor.setValue(data.content);
          isRemoteUpdate.current = false;
        }

        if (data.type === "CODE_CHANGE") {

          const editor = editorRef.current;
          if (!editor) return;

          const model = editor.getModel();

          isRemoteUpdate.current = true;

          if (model && model.getValue() !== data.content) {
            editor.setValue(data.content);
          }

          isRemoteUpdate.current = false;

        }

        if (data.type === "CURSOR_CHANGE") {
          const { userName: remoteUserName, position } = data;
          
          if (remoteUserName === userName || !remoteUserName) return;

          const editor = editorRef.current;
          const monaco = monacoRef.current;
          if (!editor || !monaco) return;

          // 1. Update Monaco Decoration (the colored bar)
          const color = getColorForUser(remoteUserName);
          const className = `remote-cursor-${remoteUserName.replace(/[^a-zA-Z0-9]/g, '')}`;

          if (!document.getElementById(`style-${className}`)) {
            const style = document.createElement('style');
            style.id = `style-${className}`;
            style.innerHTML = `
              .${className} {
                border-left: 2px solid ${color};
                position: relative;
                z-index: 10;
              }
            `;
            document.head.appendChild(style);
          }

          const newDecoration = {
            range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            options: {
              className: className,
              hoverMessage: { value: `**User:** ${remoteUserName}` },
              isWholeLine: false,
            }
          };

          const oldDecorations = decorationsRef.current[remoteUserName] || [];
          decorationsRef.current[remoteUserName] = editor.deltaDecorations(oldDecorations, [newDecoration]);
          
          // 2. Update React State for HTML Nametag
          const pixelPos = editor.getScrolledVisiblePosition({
            lineNumber: position.lineNumber,
            column: position.column
          });
          
          setRemoteCursors(prev => ({
            ...prev,
            [remoteUserName]: {
              lineNumber: position.lineNumber,
              column: position.column,
              top: pixelPos?.top || 0,
              left: pixelPos?.left || 0,
              color: color,
              visible: !!pixelPos
            }
          }));
        }

      } catch (err) {
        console.error("WebSocket parse error:", err);
      }

    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
      Object.keys(decorationsRef.current).forEach(user => {
        const className = `remote-cursor-${user.replace(/[^a-zA-Z0-9]/g, '')}`;
        const style = document.getElementById(`style-${className}`);
        if(style) style.remove();
      });
    };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, userName]); // Exclude code dependency to avoid reconnecting

  const handleEditorChange = (value) => {

    if (isRemoteUpdate.current) return;

    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
      type: "CODE_CHANGE",
      room: room,
      userName: userName,
      content: value
    }));

  };

  const handleEditorDidMount = (editor, monaco) => {

    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '4d7a5a' },
        { token: 'string', foreground: 'd7ba7d' },
        { token: 'comment', foreground: '6a9955', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#1e1e1e'
      }
    });

    monaco.editor.setTheme('custom-dark');
    editor.setValue(code);

    editor.onDidChangeCursorPosition((e) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({
        type: "CURSOR_CHANGE",
        room: room,
        userName: userName,
        position: e.position
      }));
    });
  };

  return (
    <div style={{ height: "100%", position: "relative" }}>
      <Editor
        height="100%"
        width="100%"
        language="python"
        defaultValue={code}
        theme="vs-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
        }}
      />
      
      {/* Render remote nametags */}
      {Object.entries(remoteCursors).map(([name, cursor]) => {
        if (!cursor.visible) return null;
        
        return (
          <div
            key={name}
            style={{
              position: 'absolute',
              top: cursor.top - 20, // Position above the cursor line
              left: cursor.left,
              backgroundColor: cursor.color,
              color: '#fff',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {name}
          </div>
        );
      })}
    </div>
  );
}
