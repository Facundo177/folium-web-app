import CheckCircleIcon from "./CheckCircleIcon";

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-6 z-300 text-[#f4ecd8] border border-rooster px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in bg-[#fcfbfa] dark:bg-[#130f0e]">
      <CheckCircleIcon/>
      <span className="font-body-md text-sm italic">{message}</span>
    </div>
  );
}
