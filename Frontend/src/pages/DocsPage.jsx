import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import readmeContent from '../../../README.md?raw';
import Navbar from '../components/layout/Navbar';

export default function DocsPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', overflowX: 'hidden', color: 'var(--color-text-primary)' }}>
      <Navbar />
      <div className="docs-container markdown-body" style={{ maxWidth: '900px', margin: '0 auto', padding: '120px 40px 80px' }}>
        <style>{`
          .markdown-body {
            color: var(--color-text-primary);
            font-family: var(--font-primary);
            line-height: 1.6;
          }
          .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
            font-family: 'Plus Jakarta Sans', sans-serif;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            color: var(--color-text-primary);
          }
          .markdown-body h1 { font-size: 2.2em; font-weight: 700; border-bottom: 1px solid var(--color-glass-border); padding-bottom: 0.3em; }
          .markdown-body h2 { font-size: 1.8em; font-weight: 600; border-bottom: 1px solid var(--color-glass-border); padding-bottom: 0.3em; }
          .markdown-body p { margin-bottom: 1.2em; }
          .markdown-body a { color: var(--color-jade); text-decoration: none; }
          .markdown-body a:hover { text-decoration: underline; }
          .markdown-body ul, .markdown-body ol { padding-left: 2em; margin-bottom: 1.2em; }
          .markdown-body li { margin-bottom: 0.5em; }
          .markdown-body blockquote {
            margin: 0 0 1.2em 0;
            padding: 0.5em 1em;
            color: var(--color-text-secondary);
            border-left: 4px solid var(--color-jade);
            background: var(--color-surface-2);
            border-radius: 0 4px 4px 0;
          }
          .markdown-body code {
            background: var(--color-surface-2);
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9em;
          }
          .markdown-body pre {
            background: var(--color-surface-2);
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            border: 1px solid var(--color-glass-border);
            margin-bottom: 1.2em;
          }
          .markdown-body pre code {
            background: none;
            padding: 0;
            color: var(--color-text-primary);
          }
          .markdown-body img {
            max-width: 100%;
            border-radius: 8px;
            border: 1px solid var(--color-glass-border);
            margin-top: 0.5em;
          }
          .markdown-body hr {
            border: 0;
            height: 1px;
            background: var(--color-glass-border);
            margin: 2em 0;
          }
          .markdown-body table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1.2em;
          }
          .markdown-body th, .markdown-body td {
            padding: 12px;
            border: 1px solid var(--color-glass-border);
            text-align: left;
          }
          .markdown-body th {
            background: var(--color-surface-2);
            font-weight: 600;
          }
        `}</style>
        
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({node, ...props}) => {
              let src = props.src;
              if (src && src.startsWith('./screenshots/')) {
                src = src.replace('./screenshots/', '/screenshots/');
              } else if (src && src.startsWith('screenshots/')) {
                src = src.replace('screenshots/', '/screenshots/');
              }
              return <img {...props} src={src} />;
            }
          }}
        >
          {readmeContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}
