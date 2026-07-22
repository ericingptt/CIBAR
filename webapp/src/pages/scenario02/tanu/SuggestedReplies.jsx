export function SuggestedReplies({ options, onChoose }) {
  return (
    <div className="tanu-suggested-replies">
      <div className="tanu-suggested-label">選擇一個回覆</div>
      <div className="tanu-suggested-pills">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="tanu-suggested-pill"
            onClick={() => onChoose(i)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
