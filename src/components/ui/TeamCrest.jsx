export default function TeamCrest({ src, name, size = 24 }) {
  if (!src) {
    return (
      <div
        className="rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0"
        style={{ width: size, height: size }}
      >
        {name?.charAt(0) || "?"}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="shrink-0 object-contain"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  );
}
