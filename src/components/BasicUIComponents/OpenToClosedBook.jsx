import { Book, BookOpen } from "lucide-react";

export default function OpenToClosedBook({ open, className = "w-5 h-5" }) {
  return open ? <BookOpen className={className} /> : <Book className={className} />;
}
