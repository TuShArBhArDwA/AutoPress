import Link from "next/link";
import { DigestItem } from "@/types";
import { getCategoryColor } from "@/lib/utils";

interface PageProps {
  params: { slug: string };
}

function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="font-serif text-4xl font-bold mb-4">Story Not Found</h1>
      <p className="text-muted mb-8">
        The article you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-accent hover:text-accent-secondary transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to stories
      </Link>
    </div>
  );
}

export default function NotFoundPage({ params }: PageProps) {
  return <NotFound />;
}
