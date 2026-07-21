export function Platform({ variant = '', className = '', children }) {
  return <section className={`platform${variant ? ' ' + variant : ''}${className ? ' ' + className : ''}`}>{children}</section>;
}

export function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
