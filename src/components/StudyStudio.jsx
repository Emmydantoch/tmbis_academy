import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function StudyStudio() {
  const [mode, setMode] = useState('summary'); // summary | flashcards
  const [text, setText] = useState('');
  const [materials, setMaterials] = useState([]);
  const [materialId, setMaterialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [flipIndex, setFlipIndex] = useState(null);

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
              Generate {mode === 'summary' ? 'Summary' : 'Flashcards'}
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