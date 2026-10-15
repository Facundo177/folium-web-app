import CheckCircleIcon from "./CheckCircleIcon";

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed top-3 left-[50%] translate-x-[-50%] z-300 border border-rooster px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in text-primary bg-on-primary">
      <CheckCircleIcon/>
      <span className="font-body-md text-sm italic">{message}</span>
    </div>
  );
}
