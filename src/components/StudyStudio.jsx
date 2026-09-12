import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function StudyStudio() {
  const [mode, setMode] = useState('summary'); // summary | flashcards | visual
  const [text, setText] = useState('');
  const [materials, setMaterials] = useState([]);
  const [materialId, setMaterialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [flipIndex, setFlipIndex] = useState(null);
  const [visual, setVisual] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('library/materials/');
        setMaterials(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSummary('');
    setFlashcards([]);
    setFlipIndex(null);
    setVisual(null);

    if (!text.trim() && !materialId) {
      setError('Paste study text or select a library material.');
      return;
    }

    setLoading(true);
    try {
      const payload = { mode };
      if (text.trim()) payload.text = text.trim();
      if (materialId) payload.material_id = Number(materialId);

      const res = await api.post('library/studio/generate/', payload);

      if (res.data.mode === 'flashcards') {
        setFlashcards(res.data.flashcards || []);
      } else if (res.data.mode === 'visual') {
        setVisual(res.data.visual || null);
      } else {
        setSummary(res.data.summary || '');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        'Generation failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="bg-surface-container rounded-3xl p-10 mb-10 border border-outline-variant">
        <h2 className="text-4xl font-bold text-primary mb-3">Study Studio</h2>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Turn notes and library materials into clear summaries or practice flashcards.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-6 mb-12">
        {/* Mode */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode('summary')}
            className={`px-6 py-3 rounded-2xl text-sm font-medium ${
              mode === 'summary'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container border border-outline-variant'
            }`}
          >
            Summary
          </button>
          <button
            type="button"
            onClick={() => setMode('flashcards')}
            className={`px-6 py-3 rounded-2xl text-sm font-medium ${
              mode === 'flashcards'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container border border-outline-variant'
            }`}
          >
            Flashcards
          </button>
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={`px-6 py-3 rounded-2xl text-sm font-medium ${
              mode === 'visual'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container border border-outline-variant'
            }`}
          >
            Concept Map
          </button>
        </div>

        {/* Material picker */}
        <div>
          <label className="block text-sm text-on-surface mb-2">
            From E-Library (optional)
          </label>
          <select
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            className="w-full max-w-xl bg-surface-container-lowest border border-outline-variant rounded-2xl px-4 py-3 text-on-surface focus:border-primary outline-none"
          >
            <option value="">— Paste text only —</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
          <p className="text-xs text-on-surface-variant mt-2">
            Materials need a title/description for best results. Full PDF text extraction can be added later.
          </p>
        </div>

        {/* Text input */}
        <div>
          <label className="block text-sm text-on-surface mb-2">
            Paste study material
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Paste lecture notes, chapter text, or key points here..."
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-2xl px-5 py-4 text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary outline-none"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 bg-primary text-on-primary font-bold rounded-2xl hover:brightness-110 disabled:opacity-70 flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
              Generating...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">auto_awesome</span>
              Generate {mode === 'summary' ? 'Summary' : mode === 'visual' ? 'Concept Map' : 'Flashcards'}
            </>
          )}
        </button>
      </form>

      {/* Summary result */}
      {summary && (
        <div className="bg-surface-container rounded-3xl border border-outline-variant p-8 mb-10">
          <h3 className="text-xl font-bold text-primary mb-4">Summary</h3>
          <div className="text-on-surface whitespace-pre-wrap leading-relaxed">
            {summary}
          </div>
        </div>
      )}

      {visual && (
        <section className="mb-10" aria-labelledby="concept-map-title">
          <div className="bg-surface-container rounded-3xl border border-outline-variant p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary mb-2">
                  Visual study guide
                </p>
                <h3 id="concept-map-title" className="text-2xl font-bold text-primary">
                  {visual.title || 'Concept map'}
                </h3>
              </div>
              <div className="rounded-2xl bg-primary/10 border border-primary/20 px-5 py-3 text-center">
                <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">
                  Central topic
                </p>
                <p className="font-bold text-primary">
                  {visual.central_topic || 'Key ideas'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(visual.nodes || []).map((node, index) => (
                <article
                  key={node.id || index}
                  className="relative bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 min-h-[150px]"
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary text-sm font-bold mb-4">
                    {index + 1}
                  </span>
                  <h4 className="font-bold text-on-surface mb-2">{node.label}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{node.detail}</p>
                </article>
              ))}
            </div>

            {(visual.relationships || []).length > 0 && (
              <div className="mt-8 pt-6 border-t border-outline-variant">
                <h4 className="text-sm uppercase tracking-widest text-primary mb-4">
                  How the ideas connect
                </h4>
                <div className="flex flex-wrap gap-3">
                  {visual.relationships.map((relationship, index) => {
                    const from = visual.nodes?.find((node) => node.id === relationship.from);
                    const to = visual.nodes?.find((node) => node.id === relationship.to);
                    if (!from || !to) return null;
                    return (
                      <div
                        key={`${relationship.from}-${relationship.to}-${index}`}
                        className="flex items-center gap-2 rounded-xl bg-surface-container-lowest border border-outline-variant px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-on-surface">{from.label}</span>
                        <span className="material-symbols-outlined text-primary text-base">arrow_forward</span>
                        <span className="text-primary">{relationship.label || 'connects to'}</span>
                        <span className="material-symbols-outlined text-primary text-base">arrow_forward</span>
                        <span className="font-medium text-on-surface">{to.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Flashcards result */}
      {flashcards.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-primary mb-6">
            Flashcards ({flashcards.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flashcards.map((card, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setFlipIndex(flipIndex === index ? null : index)
                }
                className="text-left bg-surface-container border border-outline-variant rounded-2xl p-6 min-h-[140px] hover:border-primary transition-all"
              >
                <p className="text-xs uppercase tracking-widest text-primary mb-3">
                  {flipIndex === index ? 'Answer' : 'Question'} · click to flip
                </p>
                <p className="text-on-surface font-medium leading-relaxed">
                  {flipIndex === index ? card.answer : card.question}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}