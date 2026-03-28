export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-4xl mb-4">😵</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Something went wrong
      </h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary text-sm">
          Try Again
        </button>
      )}
    </div>
  );
}
