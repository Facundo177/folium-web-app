export default function BookCover({
  imageSrc = "https://placehold.co/600x400?text=Placeholder\\nImage",
  alt = "The Count of Monte Cristo Cover",
}) {
  return (
    <div className="border border-outline-variant rounded-DEFAULT bg-surface-container-lowest p-gutter flex flex-col justify-center items-center h-full min-h-[300px] shadow-sm">
      <img
        src={imageSrc}
        alt={alt}
        className="w-full max-w-62 object-contain drop-shadow-md"
      />
    </div>
  );
}
