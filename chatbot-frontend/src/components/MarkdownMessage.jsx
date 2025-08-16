import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // code block theme

const MarkdownMessage = ({ text }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            className="text-orange-400 underline hover:text-orange-300"
            target="_blank"
            rel="noopener noreferrer"
          />
        ),
        code: ({ node, inline, className, children, ...props }) =>
          !inline ? (
            <pre className="bg-gray-900 text-white p-3 rounded-lg overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          ) : (
            <code className="bg-gray-200 px-1 rounded">{children}</code>
          ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default MarkdownMessage;
