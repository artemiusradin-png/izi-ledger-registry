import Link from "next/link";
import { getAllWorks, getRegistryMeta } from "@/lib/works";

type HomeProps = {
  searchParams: Promise<{
    q?: string;
    language?: string;
    kind?: string;
    sort?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomeProps) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const language = (params.language ?? "all").trim();
  const kind = (params.kind ?? "all").trim();
  const sort = (params.sort ?? "newest").trim();

  const allWorks = getAllWorks();
  const meta = getRegistryMeta();
  const languages = [...new Set(allWorks.map((work) => work.language))].sort();
  const kinds = [...new Set(allWorks.map((work) => work.kind))].sort();

  const filteredWorks = allWorks.filter((work) => {
    const matchesSearch =
      q.length === 0 ||
      work.title.toLowerCase().includes(q) ||
      work.summary.toLowerCase().includes(q) ||
      work.tags.some((tag) => tag.toLowerCase().includes(q));

    const matchesLanguage = language === "all" || work.language === language;
    const matchesKind = kind === "all" || work.kind === kind;

    return matchesSearch && matchesLanguage && matchesKind;
  });

  const works = [...filteredWorks].sort((a, b) => {
    if (sort === "title-asc") {
      return a.title.localeCompare(b.title);
    }
    if (sort === "title-desc") {
      return b.title.localeCompare(a.title);
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <main className="page">
      <header className="hero">
        <p className="kicker">Artemis Radin - Institute of Legislative Ideas</p>
        <h1>General Ledger Registry</h1>
        <p className="subtitle">All analytics in one searchable portfolio.</p>
        <p className="meta">
          Total works: {allWorks.length} · Showing: {works.length} · Updated:{" "}
          {new Date(meta.generatedAt).toLocaleString()}
        </p>
      </header>

      <form className="filters" method="get">
        <label className="field">
          <span>Search</span>
          <input
            type="search"
            name="q"
            placeholder="Title, summary, tags"
            defaultValue={params.q ?? ""}
          />
        </label>

        <label className="field">
          <span>Language</span>
          <select name="language" defaultValue={language}>
            <option value="all">All</option>
            {languages.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Type</span>
          <select name="kind" defaultValue={kind}>
            <option value="all">All</option>
            {kinds.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Sort</span>
          <select name="sort" defaultValue={sort}>
            <option value="newest">Recently updated</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </label>

        <div className="filter-actions">
          <button type="submit" className="btn">Apply</button>
          <Link href="/" className="btn ghost">Reset</Link>
        </div>
      </form>

      <section className="grid">
        {works.length === 0 ? (
          <article className="empty-state">
            <h2>No matching documents</h2>
            <p>Change filters or clear search to show all works.</p>
          </article>
        ) : (
          works.map((work) => (
            <article className="card" key={work.slug}>
              <div className="card-top">
                <p className="tag">{work.language}</p>
                <p className="tag">{work.kind}</p>
              </div>
              <h2>{work.title}</h2>
              <p className="card-summary">{work.summary}</p>
              <p className="small">Updated: {new Date(work.updatedAt).toLocaleDateString()}</p>
              <div className="tags-row">
                {work.tags.map((tag) => (
                  <span className="chip" key={`${work.slug}-${tag}`}>{tag}</span>
                ))}
              </div>
              <div className="actions">
                <Link href={`/work/${work.slug}`} className="btn">Open</Link>
                {work.pdfPath ? (
                  <a href={work.pdfPath} className="btn ghost" target="_blank" rel="noreferrer">PDF</a>
                ) : null}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
