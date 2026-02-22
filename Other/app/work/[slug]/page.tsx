import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllWorks, getWorkBySlug } from "@/lib/works";
import { prefixPath } from "@/lib/url";
import DocumentFrame from "@/app/components/document-frame";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllWorks().map((work) => ({ slug: work.slug }));
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  if (!work) {
    notFound();
  }

  return (
    <main className="work-page">
      <div className="work-header">
        <Link href="/" className="btn ghost back-link">Back to registry</Link>
        <h1>{work.title}</h1>
        <p className="work-summary">{work.summary}</p>
        <div className="card-top">
          <p className={`tag ${work.language === "Ukrainian" ? "tag-ukrainian" : ""}`}>{work.language}</p>
          <p className="tag">{work.kind}</p>
          <p className="tag" suppressHydrationWarning>Updated {new Date(work.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className="tags-row">
          {work.tags.map((tag) => (
            <span className="chip" key={`${work.slug}-${tag}`}>{tag}</span>
          ))}
        </div>
        <div className="actions">
          {work.pdfPath ? (
            <a href={prefixPath(work.pdfPath)} className="btn ghost" target="_blank" rel="noreferrer">PDF</a>
          ) : null}
        </div>
      </div>

      <DocumentFrame
        title={work.title}
        src={prefixPath(work.htmlPath)}
      />
    </main>
  );
}
