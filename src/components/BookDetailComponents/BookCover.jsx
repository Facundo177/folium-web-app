export default function BookCover({ imageSrc, title }){
   
  return (
    <div className="border border-outline-variant rounded-DEFAULT bg-surface-container-lowest p-gutter flex flex-col justify-center items-center h-full shadow-sm">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={title}
          className="w-full max-w-62 object-contain drop-shadow-md"
        />
      ) : (
        <div className="w-full max-w-62 aspect-[2/3] bg-primary-container flex items-center justify-center p-4 text-center">
          <span className="font-serif text-3xl text-on-primary italic leading-none">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}
