import GoBackButton from "../BasicUIComponents/GoBackButton";

export default function BookDetailHeader({ genres = [] }) {

  return (
    <div className="flex justify-between items-center py-stack-sm mb-stack-md text-body-md text-on-surface-variant font-sans">
      <GoBackButton/>
      <div className="text-body-md">
        <span className="font-medium text-on-surface">{genres.join(" · ")}</span>
      </div>
    </div>
  );
}