'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, File, FolderPlus, FilePlus } from 'lucide-react';
import styles from './Explorer.module.css';

const INITIAL_FILES = {
  id: 'root',
  name: 'src',
  type: 'folder',
  isOpen: true,
  children: [
    { id: '1', name: 'main.js', type: 'file', content: 'function hello() {\n  console.log("Hello world");\n}' },
    { id: '2', name: 'utils.js', type: 'file', content: 'export const add = (a, b) => a + b;' }
  ]
};

export default function Explorer({ activeFileId, onSelectFile }) {
  const [fileSystem, setFileSystem] = useState(INITIAL_FILES);
  const [isAddingItem, setIsAddingItem] = useState(null); // 'file' or 'folder'
  const [newItemName, setNewItemName] = useState('');

  const handleCreateItem = (e, type) => {
    e.stopPropagation();
    setIsAddingItem(type);
    setNewItemName('');
    // Ensure root folder is open so we can see the input
    if (!fileSystem.isOpen) {
       setFileSystem(prev => ({...prev, isOpen: true}));
    }
  };

  const submitNewItem = (e) => {
    if (e.key === 'Enter') {
      if (!newItemName.trim()) {
        setIsAddingItem(null);
        return;
      }

      const newItem = {
        id: Date.now().toString(),
        name: newItemName.trim(),
        type: isAddingItem,
        ...(isAddingItem === 'folder' ? { isOpen: true, children: [] } : { content: '' })
      };

      setFileSystem(prev => ({
        ...prev,
        children: [...prev.children, newItem]
      }));
      
      setIsAddingItem(null);
      
      if (isAddingItem === 'file') {
         onSelectFile(newItem);
      }
    } else if (e.key === 'Escape') {
      setIsAddingItem(null);
    }
  };

  const toggleFolder = (e) => {
    e.stopPropagation();
    setFileSystem(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  return (
    <div className={styles.explorer}>
      <div className={styles.header}>
        <span className={styles.title}>EXPLORER</span>
      </div>
      
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderTitleContainer}>
            <ChevronDown size={16} />
            <span className={styles.sectionTitle}>COLLAB-EDITOR</span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn} onClick={(e) => handleCreateItem(e, 'file')} title="New File">
              <FilePlus size={14} />
            </button>
            <button className={styles.actionBtn} onClick={(e) => handleCreateItem(e, 'folder')} title="New Folder">
              <FolderPlus size={14} />
            </button>
          </div>
        </div>
        
        <div className={styles.fileTree}>
          <div className={styles.folder}>
            <div className={styles.folderRow} onClick={toggleFolder}>
              {fileSystem.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className={styles.folderName}>{fileSystem.name}</span>
            </div>
            
            {fileSystem.isOpen && (
              <div className={styles.folderContents}>
                {/* Input for new items */}
                {isAddingItem && (
                  <div className={`${styles.fileRow} ${styles.inputRow}`}>
                    {isAddingItem === 'file' ? <File size={14} className={styles.fileIcon} /> : <ChevronRight size={14} />}
                    <input 
                      autoFocus
                      type="text" 
                      className={styles.addInput}
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      onKeyDown={submitNewItem}
                      onBlur={() => setIsAddingItem(null)}
                      placeholder={`New ${isAddingItem}...`}
                    />
                  </div>
                )}
              
                {/* Render children */}
                {fileSystem.children.map(item => {
                  if (item.type === 'file') {
                    return (
                      <div 
                        key={item.id} 
                        className={`${styles.fileRow} ${activeFileId === item.id ? styles.active : ''}`}
                        onClick={() => onSelectFile(item)}
                      >
                        <File size={14} className={styles.fileIcon} />
                        <span className={styles.fileName}>{item.name}</span>
                      </div>
                    );
                  } else if (item.type === 'folder') {
                     return (
                        <div key={item.id} className={styles.folder}>
                            <div className={styles.folderRow}>
                                <ChevronRight size={14} />
                                <span className={styles.folderName}>{item.name}</span>
                            </div>
                        </div>
                     )
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
