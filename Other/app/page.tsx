"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getAllWorks, getRegistryMeta } from "@/lib/works";
import { prefixPath } from "@/lib/url";

export default function HomePage() {
  const allWorks = getAllWorks();
  const meta = getRegistryMeta();

  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState("newest");

  const languages = useMemo(() => [...new Set(allWorks.map((work) => work.language))].sort(), [allWorks]);
  const kinds = useMemo(() => [...new Set(allWorks.map((work) => work.kind))].sort(), [allWorks]);
  const worksBySlug = useMemo(() => new Map(allWorks.map((work) => [work.slug, work])), [allWorks]);

  const works = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = allWorks.filter((work) => {
      const matchesSearch =
        q.length === 0 ||
        work.title.toLowerCase().includes(q) ||
        work.summary.toLowerCase().includes(q) ||
        work.tags.some((tag) => tag.toLowerCase().includes(q));

      const matchesLanguage = language === "all" || work.language === language;
      const matchesKind = kind === "all" || work.kind === kind;

      return matchesSearch && matchesLanguage && matchesKind;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "title-asc") {
        return a.title.localeCompare(b.title);
      }
      if (sort === "title-desc") {
        return b.title.localeCompare(a.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [allWorks, kind, language, query, sort]);

  const analysisWorks = works.filter((work) => work.kind === "Analysis");
  const summaryWorks = works.filter((work) => work.kind === "Summary");

  function resetFilters() {
    setQuery("");
    setLanguage("all");
    setKind("all");
    setSort("newest");
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="kicker">Artemis Radin - Institute of Legislative Ideas</p>
        <h1>General Ledger Registry</h1>
        <p className="subtitle">All analytics in one searchable portfolio.</p>
        <p className="meta" suppressHydrationWarning>
          Total works: {allWorks.length} · Showing: {works.length} · Updated: {new Date(meta.generatedAt).toLocaleString()}
        </p>
      </header>

      <section className="filters" aria-label="Filters">
        <label className="field">
          <span>Search</span>
          <input
            type="search"
            placeholder="Title, summary, tags"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Language</span>
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
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
          <select value={kind} onChange={(event) => setKind(event.target.value)}>
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
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Recently updated</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </label>

        <div className="filter-actions">
          <button type="button" className="btn ghost" onClick={resetFilters}>Reset</button>
        </div>
      </section>

      <section className="type-switch" aria-label="Browse by type">
        <button
          type="button"
          className={`switch-btn ${kind === "all" ? "active" : ""}`}
          onClick={() => setKind("all")}
        >
          All ({works.length})
        </button>
        <button
          type="button"
          className={`switch-btn ${kind === "Analysis" ? "active" : ""}`}
          onClick={() => setKind("Analysis")}
        >
          Analysis ({analysisWorks.length})
        </button>
        <button
          type="button"
          className={`switch-btn ${kind === "Summary" ? "active" : ""}`}
          onClick={() => setKind("Summary")}
        >
          Summary ({summaryWorks.length})
        </button>
      </section>

      {works.length === 0 ? (
        <section className="grid">
          <article className="empty-state">
            <h2>No matching documents</h2>
            <p>Change filters or clear search to show all works.</p>
          </article>
        </section>
      ) : (
        <>
          {(kind === "all" || kind === "Analysis") && analysisWorks.length > 0 ? (
            <section className="section-block">
              <div className="section-head">
                <h2>Analysis</h2>
                <p>{analysisWorks.length} document(s)</p>
              </div>
              <div className="grid">
                {analysisWorks.map((work) => (
                  (() => {
                    const relatedSummaries = (work.relatedSlugs ?? [])
                      .map((slug) => worksBySlug.get(slug))
                      .filter((relatedWork): relatedWork is (typeof allWorks)[number] => (
                        Boolean(relatedWork && relatedWork.kind === "Summary")
                      ));

                    return (
                      <article className="card" key={work.slug}>
                        <div className="card-top">
                          <p className="tag">{work.language}</p>
                          <p className="tag">{work.kind}</p>
                        </div>
                        <h2>{work.title}</h2>
                        <p className="card-summary">{work.summary}</p>
                        <p className="small" suppressHydrationWarning>Updated: {new Date(work.updatedAt).toLocaleDateString()}</p>
                        <div className="tags-row">
                          {work.tags.map((tag) => (
                            <span className="chip" key={`${work.slug}-${tag}`}>{tag}</span>
                          ))}
                        </div>
                        <div className="actions">
                          <Link href={`/work/${work.slug}`} className="btn">Open</Link>
                          {relatedSummaries.map((summaryWork) => (
                            <Link
                              key={`${work.slug}-summary-${summaryWork.slug}`}
                              href={`/work/${summaryWork.slug}`}
                              className="btn ghost"
                            >
                              {relatedSummaries.length > 1 ? `Summary (${summaryWork.language})` : "Summary"}
                            </Link>
                          ))}
                          {work.pdfPath ? (
                            <a href={prefixPath(work.pdfPath)} className="btn ghost" target="_blank" rel="noreferrer">PDF</a>
                          ) : null}
                        </div>
                      </article>
                    );
                  })()
                ))}
              </div>
            </section>
          ) : null}

          {(kind === "all" || kind === "Summary") && summaryWorks.length > 0 ? (
            <section className="section-block">
              <div className="section-head">
                <h2>Summary</h2>
                <p>{summaryWorks.length} document(s)</p>
              </div>
              <div className="grid">
                {summaryWorks.map((work) => (
                  <article className="card" key={work.slug}>
                    <div className="card-top">
                      <p className="tag">{work.language}</p>
                      <p className="tag">{work.kind}</p>
                    </div>
                    <h2>{work.title}</h2>
                    <p className="card-summary">{work.summary}</p>
                    <p className="small" suppressHydrationWarning>Updated: {new Date(work.updatedAt).toLocaleDateString()}</p>
                    <div className="tags-row">
                      {work.tags.map((tag) => (
                        <span className="chip" key={`${work.slug}-${tag}`}>{tag}</span>
                      ))}
                    </div>
                    <div className="actions">
                      <Link href={`/work/${work.slug}`} className="btn">Open</Link>
                      {work.pdfPath ? (
                        <a href={prefixPath(work.pdfPath)} className="btn ghost" target="_blank" rel="noreferrer">PDF</a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
