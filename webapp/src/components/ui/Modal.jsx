export function Modal({ show, children }) {
  return <div className={`modal${show ? ' show' : ''}`}>{children}</div>;
}
