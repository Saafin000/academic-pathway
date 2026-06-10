import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

const REC_BADGE = {
  'Certification Program': 'bg-green-100 text-green-800 border border-green-200',
  DBA:                     'bg-blue-100 text-blue-800 border border-blue-200',
  PhD:                     'bg-purple-100 text-purple-800 border border-purple-200',
  'Honorary Doctorate':    'bg-yellow-100 text-yellow-800 border border-yellow-200',
};

const REC_ICON = {
  'Certification Program': '🎓',
  DBA:                     '💼',
  PhD:                     '🔬',
  'Honorary Doctorate':    '🏆',
};

const STAT_CARDS = [
  { key: 'total',                label: 'Total',       icon: '📊', bg: 'from-blue-500 to-blue-600'     },
  { key: 'Certification Program', label: 'Cert.',      icon: '🎓', bg: 'from-green-500 to-green-600'   },
  { key: 'DBA',                  label: 'DBA',         icon: '💼', bg: 'from-sky-500 to-sky-600'       },
  { key: 'PhD',                  label: 'PhD',         icon: '🔬', bg: 'from-purple-500 to-purple-600' },
  { key: 'Honorary Doctorate',   label: 'Honorary',    icon: '🏆', bg: 'from-yellow-500 to-yellow-600' },
];

// ─── Skeleton components ──────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="rounded-2xl bg-gray-200 animate-pulse h-24" />
  );
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className={`h-4 bg-gray-200 rounded ${i === 1 ? 'w-3/4' : i === 3 ? 'w-full' : 'w-1/2'}`} />
        </td>
      ))}
    </tr>
  );
}

function MobileCardSkeleton() {
  return (
    <div className="p-4 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-6 bg-gray-200 rounded-full w-1/3" />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon, label, count, bg, loading }) {
  if (loading) return <StatSkeleton />;
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-5 text-white shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-extrabold">{count}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function RecBadge({ recommendation }) {
  const cls  = REC_BADGE[recommendation] || 'bg-gray-100 text-gray-700 border border-gray-200';
  const icon = REC_ICON[recommendation]  || '📚';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${cls}`}>
      <span>{icon}</span>
      {recommendation}
    </span>
  );
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [expandedId,  setExpandedId]  = useState(null); // for roadmap/explanation expand

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/submissions`);
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const stats = {
    total:                 submissions.length,
    'Certification Program': submissions.filter((s) => s.recommendation === 'Certification Program').length,
    DBA:                   submissions.filter((s) => s.recommendation === 'DBA').length,
    PhD:                   submissions.filter((s) => s.recommendation === 'PhD').length,
    'Honorary Doctorate':  submissions.filter((s) => s.recommendation === 'Honorary Doctorate').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">All Submissions</h1>
          <p className="text-gray-500 mt-1 text-sm">Overview of all academic pathway recommendations generated.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetch} disabled={loading} className="btn-secondary text-sm">
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link to="/" className="btn-primary text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {STAT_CARDS.map((c) => (
          <StatCard key={c.key} icon={c.icon} label={c.label} count={stats[c.key] ?? 0} bg={c.bg} loading={loading} />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 mb-6">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-sm">Failed to load submissions</p>
            <p className="text-sm mt-0.5 text-red-600">{error}</p>
            <button onClick={fetch} className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-900">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {!error && (
        <div className="card overflow-hidden p-0">
          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  {['#', 'Name', 'Email', 'Career Goal', 'Recommendation', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 font-semibold text-gray-600 uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <span className="text-5xl block mb-3">📭</span>
                      <p className="text-gray-500 font-medium">No submissions yet</p>
                      <Link to="/" className="text-blue-600 text-sm hover:underline mt-1 inline-block font-semibold">
                        Be the first →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub, idx) => (
                    <>
                      <tr
                        key={sub.id}
                        onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                        className="hover:bg-blue-50/40 transition-colors duration-150 cursor-pointer"
                      >
                        <td className="px-5 py-4 text-gray-400 font-medium">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {sub.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="font-medium text-gray-900 truncate max-w-[120px]">{sub.full_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-500 truncate max-w-[160px]">{sub.email}</td>
                        <td className="px-5 py-4 text-gray-600 max-w-[200px]">
                          <p className="truncate" title={sub.career_goal}>{sub.career_goal}</p>
                        </td>
                        <td className="px-5 py-4">
                          <RecBadge recommendation={sub.recommendation} />
                        </td>
                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap text-xs">{formatDate(sub.created_at)}</td>
                      </tr>

                      {/* Expandable explanation row */}
                      {expandedId === sub.id && sub.explanation && (
                        <tr key={`${sub.id}-exp`} className="bg-blue-50/60">
                          <td />
                          <td colSpan={5} className="px-5 py-4">
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Explanation</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{sub.explanation}</p>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <MobileCardSkeleton key={i} />)
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center">
                <span className="text-5xl block mb-3">📭</span>
                <p className="text-gray-500 font-medium">No submissions yet</p>
                <Link to="/" className="text-blue-600 text-sm hover:underline mt-2 inline-block font-semibold">
                  Get a recommendation →
                </Link>
              </div>
            ) : (
              submissions.map((sub) => (
                <div key={sub.id}>
                  <div
                    className="p-4 hover:bg-blue-50/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {sub.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{sub.full_name}</p>
                          <p className="text-xs text-gray-400 truncate">{sub.email}</p>
                        </div>
                      </div>
                      <RecBadge recommendation={sub.recommendation} />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2 ml-13">{sub.career_goal}</p>
                    <p className="mt-1 text-xs text-gray-300">{formatDate(sub.created_at)}</p>
                  </div>
                  {expandedId === sub.id && sub.explanation && (
                    <div className="px-4 pb-4 bg-blue-50/60">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Explanation</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{sub.explanation}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {!loading && submissions.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-600">{submissions.length}</span> submission{submissions.length !== 1 ? 's' : ''} · Click a row to see explanation
              </p>
              <p className="text-xs text-gray-400">Sorted by most recent</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
