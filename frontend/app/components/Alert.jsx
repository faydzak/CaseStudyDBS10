export default function Alert({ message, type = "error" }) {
  if (!message) return null;

  const styles = {
    error:   "bg-brand-50 text-brand-700 border-l-4 border-brand-500",
    success: "bg-green-50 text-green-700 border-l-4 border-green-500",
  };

  return (
    <div className={`${styles[type]} rounded-lg px-4 py-3 text-sm`}>
      {message}
    </div>
  );
}