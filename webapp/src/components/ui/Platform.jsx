export function Platform({ variant = '', children }) {
  return <section className={`platform${variant ? ' ' + variant : ''}`}>{children}</section>;
}

export function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
