'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode2, FolderPlus, FilePlus } from 'lucide-react';
import { createInitialFileSystem, getLanguageById } from '@/lib/languages';
import styles from './Explorer.module.css';

const getFileParts = (fileName) => {
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex <= 0) {
    return { baseName: fileName, extension: '' };
  }

  return {
    baseName: fileName.slice(0, lastDotIndex),
    extension: fileName.slice(lastDotIndex + 1),
  };
};

export default function Explorer({ activeFileId, defaultLanguageId, onSelectFile }) {
  const defaultLanguage = getLanguageById(defaultLanguageId);
  const [fileSystem, setFileSystem] = useState(() => createInitialFileSystem(defaultLanguage.id));
  const [isAddingItem, setIsAddingItem] = useState(null); // 'file' or 'folder'
  const [newItemName, setNewItemName] = useState('');

  const normalizeNewFileName = (name) => {
    const trimmedName = name.trim();

    if (!trimmedName || isAddingItem !== 'file') {
      return trimmedName;
    }

    return trimmedName.includes('.') ? trimmedName : `${trimmedName}.${defaultLanguage.extension}`;
  };

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
      const normalizedName = normalizeNewFileName(newItemName);

      if (!normalizedName) {
        setIsAddingItem(null);
        return;
      }

      const newItem = {
        id: Date.now().toString(),
        name: normalizedName,
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
                    {isAddingItem === 'file' ? <FileCode2 size={14} className={styles.fileIcon} /> : <ChevronRight size={14} />}
                    <input 
                      autoFocus
                      type="text" 
                      className={styles.addInput}
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      onKeyDown={submitNewItem}
                      onBlur={() => setIsAddingItem(null)}
                      placeholder={isAddingItem === 'file' ? defaultLanguage.newFilePlaceholder : 'New folder...'}
                    />
                  </div>
                )}
              
                {/* Render children */}
                {fileSystem.children.map(item => {
                  if (item.type === 'file') {
                    const { baseName, extension } = getFileParts(item.name);

                    return (
                      <div 
                        key={item.id} 
                        className={`${styles.fileRow} ${activeFileId === item.id ? styles.active : ''}`}
                        onClick={() => onSelectFile(item)}
                      >
                        <FileCode2 size={14} className={styles.fileIcon} />
                        <span className={styles.fileName}>{baseName}</span>
                        {extension && <span className={styles.fileExtension}>.{extension}</span>}
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
