import { useState } from 'react';
import api from '../api/axios';

export default function Journals() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [total, setTotal] = useState(0);
  const handleSearch = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) {
      setError('Enter a search term.');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await api.get('library/journals/search/', {
        params: { q, page: 1 },
      });
      setResults(res.data.results || []);
      setTotal(res.data.count || 0);
    } catch (err) {
      console.error(err);
      setResults([]);
      setError(
        err.response?.data?.detail ||
        'Search failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="bg-surface-container rounded-3xl p-10 mb-10 border border-outline-variant">
        <h2 className="text-4xl font-bold text-primary mb-3">Open Access Journals</h2>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Search free, legal open-access research papers. Results come from OpenAlex and only include open materials.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mb-10 flex flex-col sm:flex-row gap-3 max-w-2xl">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. design thinking, machine learning, education..."
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-full pl-12 pr-4 py-3.5 text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3.5 bg-primary text-on-primary font-bold rounded-full hover:brightness-110 disabled:opacity-70"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="mb-6 rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {searched && !loading && (
        <p className="text-sm text-on-surface-variant mb-6">
          {total > 0
            ? `About ${total.toLocaleString()} open-access works · showing ${results.length}`
            : 'No open-access results found. Try different keywords.'}
        </p>
      )}

      <div className="space-y-4">
        {results.map((paper) => (
          <article
            key={paper.id}
            className="bg-surface-container p-6 rounded-2xl border border-outline-variant hover:border-primary transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {paper.is_oa && (
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary font-medium">
                      Open Access
                    </span>
                  )}
                  {paper.year && (
                    <span className="text-xs text-on-surface-variant">{paper.year}</span>
                  )}
                  {paper.cited_by_count > 0 && (
                    <span className="text-xs text-on-surface-variant">
                      · {paper.cited_by_count} citations
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-on-surface mb-1">
                  {paper.title}
                </h3>

                {paper.authors?.length > 0 && (
                  <p className="text-sm text-on-surface-variant mb-3">
                    {paper.authors.join(', ')}
                  </p>
                )}

                {paper.abstract && (
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {paper.abstract}
                  </p>
                )}

                {paper.doi && (
                  <p className="text-xs text-on-surface-variant mt-3">
                    DOI: {paper.doi}
                  </p>
                )}
              </div>

              <div className="flex flex-row md:flex-col gap-2 shrink-0">
                {paper.pdf_url ? (
                  <a
                    href={paper.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-2xl font-medium hover:brightness-110"
                  >
                    <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                    PDF
                  </a>
                ) : null}
                {paper.landing_url ? (
                  <a
                    href={paper.landing_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-outline-variant px-5 py-3 rounded-2xl text-sm hover:border-primary"
                  >
                    <span className="material-symbols-outlined text-base">open_in_new</span>
                    View
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      {loading && (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl animate-spin text-primary">
            progress_activity
          </span>
          <p className="mt-4">Searching open-access journals...</p>
        </div>
      )}
    </div>
  );
}