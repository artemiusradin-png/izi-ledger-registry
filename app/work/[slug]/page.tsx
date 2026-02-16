import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllWorks, getWorkBySlug } from "@/lib/works";
import { prefixPath } from "@/lib/url";

export function generateStaticParams() {
  return getAllWorks().map((work) => ({ slug: work.slug }));
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  const useDirectOpen = slug === "german-sanctions-3page-summary-ukr";

  if (!work) {
    notFound();
  }

  return (
    <main className="work-page">
      <div className="work-header">
        <Link href="/" className="btn ghost">Back to registry</Link>
        <h1>{work.title}</h1>
        <p className="work-summary">{work.summary}</p>
        <div className="card-top">
          <p className="tag">{work.language}</p>
          <p className="tag">{work.kind}</p>
          <p className="tag">Updated {new Date(work.updatedAt).toLocaleDateString()}</p>
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

      {useDirectOpen ? (
        <div className="work-header">
          <p className="work-summary">This document is opened directly to avoid browser iframe crashes.</p>
          <div className="actions">
            <a href={prefixPath(work.htmlPath)} className="btn" target="_blank" rel="noreferrer">
              Open document
            </a>
          </div>
        </div>
      ) : (
        <iframe
          className="work-frame"
          title={work.title}
          src={prefixPath(work.htmlPath)}
        />
      )}
    </main>
  );
}
