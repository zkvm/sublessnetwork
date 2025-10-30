import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface DocsProps {
    content: string;
}

export default function Docs({ content }: DocsProps) {
    return (
        <div className="docs-container">
            <header className="docs-header">
                <Link href="/" className="back-link">
                    ← Back
                </Link>
            </header>

            <article className="markdown-content">
                <ReactMarkdown>{content}</ReactMarkdown>
            </article>

            <style jsx global>{`
        .docs-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          min-height: 100vh;
        }

        .docs-header {
          margin-bottom: 40px;
          padding-bottom: 20px;
        }

        .back-link {
          display: inline-block;
          margin-bottom: 20px;
          font-family: var(--font-heading);
          font-size: 1.2rem;
          color: var(--color-text);
          text-decoration: none;
          padding: 8px 16px;
          border: 1px solid var(--color-text);
          transition: all 0.2s ease;
        }

        .back-link:hover {
          background: var(--color-primary);
          transform: translateX(-4px);
        }

        .docs-header h1 {
          margin: 0;
          font-size: 3rem;
        }

        .markdown-content {
          font-family: var(--font-body);
          line-height: 1.8;
          color: var(--color-text);
        }

        /* Markdown Styles */
        .markdown-content h1 {
          font-size: 2.5rem;
          margin: 2rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--color-border);
        }

        .markdown-content h2 {
          font-size: 2rem;
          margin: 1.5rem 0 1rem;
          padding-bottom: 0.3rem;
          border-bottom: 1px solid var(--color-border);
        }

        .markdown-content h3 {
          font-size: 1.5rem;
          margin: 1.2rem 0 0.8rem;
        }

        .markdown-content h4 {
          font-size: 1.2rem;
          margin: 1rem 0 0.6rem;
        }

        .markdown-content p {
          margin: 1rem 0;
        }

        .markdown-content ul,
        .markdown-content ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }

        .markdown-content li {
          margin: 0.5rem 0;
        }

        .markdown-content code {
          background: var(--color-primary);
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.9em;
          font-family: var(--font-body);
        }

        .markdown-content pre {
          background: #f5f5f5;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .markdown-content pre code {
          background: none;
          padding: 0;
          border-radius: 0;
        }

        .markdown-content blockquote {
          border-left: 4px solid var(--color-text);
          background: var(--color-primary);
          padding: 1rem 1.5rem;
          margin: 1rem 0;
          font-style: italic;
        }

        .markdown-content a {
          color: var(--color-text);
          text-decoration: underline;
          font-weight: 700;
        }

        .markdown-content a:hover {
          background: var(--color-primary);
        }

        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .markdown-content th,
        .markdown-content td {
          border: 1px solid var(--color-border);
          padding: 0.75rem;
          text-align: left;
        }

        .markdown-content th {
          background: var(--color-primary);
          font-weight: 700;
        }

        .markdown-content img {
          max-width: 100%;
          height: auto;
          margin: 1rem 0;
        }

        .markdown-content hr {
          border: none;
          border-top: 2px solid var(--color-border);
          margin: 2rem 0;
        }
      `}</style>
        </div>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    // Read the README-core.md file from the project root
    const filePath = path.join(process.cwd(), '..', 'README-core.md');

    let content = '';

    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error('Error reading README-core.md:', error);
        content = '# Documentation\n\nDocumentation file not found.';
    }

    return {
        props: {
            content,
        },
    };
};
