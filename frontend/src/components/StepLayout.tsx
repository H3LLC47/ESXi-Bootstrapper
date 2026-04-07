import type { PropsWithChildren, ReactNode } from "react";

interface StepLayoutProps extends PropsWithChildren {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function StepLayout({ title, description, actions, children }: StepLayoutProps) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {actions}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  );
}

