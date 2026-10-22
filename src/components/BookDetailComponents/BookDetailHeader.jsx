import GoBackButton from "../BasicUIComponents/GoBackButton";

export default function BookDetailHeader({ category = "" }) {
  return (
    <div className="flex items-center justify-between py-2 mb-stack-md text-body-md text-on-surface-variant font-sans border-b border-outline-variant/60 pb-3">
      <GoBackButton />
    </div>
  );
}
