import type { ValidationMessage } from "../types/design";

interface ValidationPanelProps {
  title: string;
  messages: ValidationMessage[];
  tone: "error" | "warning";
}

export function ValidationPanel({ title, messages, tone }: ValidationPanelProps) {
  if (!messages.length) {
    return null;
  }

  return (
    <section className={`message-panel ${tone}`}>
      <h3>{title}</h3>
      <ul>
        {messages.map((message, index) => (
          <li key={`${message.path}-${index}`}>
            <strong>{message.path}</strong>
            <span>{message.message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

