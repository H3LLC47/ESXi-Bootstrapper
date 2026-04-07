interface CodeBlockProps {
  label: string;
  content: string;
}

export function CodeBlock({ label, content }: CodeBlockProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>{label}</h2>
        </div>
      </header>
      <div className="code-block">
        <pre>{content}</pre>
      </div>
    </section>
  );
}

