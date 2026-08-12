import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function CommandPalette({ isOpen, onClose, posts = [] }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.category?.toLowerCase().includes(q) ||
      post.excerpt?.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredPosts.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredPosts.length) % Math.max(1, filteredPosts.length));
      } else if (e.key === 'Enter' && filteredPosts[selectedIndex]) {
        window.location.href = `/posts/${filteredPosts[selectedIndex].id}`;
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredPosts, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(9, 9, 11, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="animate-modal"
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#121216',
          border: '1px solid #3F3F46',
          borderRadius: '8px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Command Prompt Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid #222227',
            gap: '10px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', color: '#38BDF8', fontSize: '14px' }}>&gt;_</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search AI posts, tags, architecture topics..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#FAFAFA',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: '#71717A',
              border: '1px solid #222227',
              borderRadius: '4px',
              padding: '2px 6px',
              textTransform: 'uppercase',
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {filteredPosts.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: '#71717A',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}
            >
              // NO_RESULTS_FOUND_FOR: &quot;{query}&quot;
            </div>
          ) : (
            filteredPosts.map((post, index) => {
              const isSelected = index === selectedIndex;
              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  onClick={onClose}
                  style={{
                    display: 'block',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? '#18181B' : 'transparent',
                    border: isSelected ? '1px solid #3F3F46' : '1px solid transparent',
                    textDecoration: 'none',
                    marginBottom: '4px',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: '#71717A',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    <span>{post.indexLabel || `// index_${String(index + 1).padStart(2, '0')}`}</span>
                    <span style={{ color: '#38BDF8' }}>[ {post.category || 'ai_engineering'} ]</span>
                  </div>
                  <div
                    style={{
                      color: '#FAFAFA',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'var(--font-sans)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {post.title}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid #222227',
            backgroundColor: '#09090B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: '#71717A',
          }}
        >
          <span>NAV: [ ↑↓ ] SELECT</span>
          <span>ENTER: OPEN</span>
        </div>
      </div>
    </div>
  );
}
