import { useEffect } from "react";

export default function Seo({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
