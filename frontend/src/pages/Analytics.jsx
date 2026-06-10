import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

// ─── Palette ──────────────────────────────────────────────────────────────────
const REC_COLOR = {
  'Certification Program': { bar: 'bg-green-500',  text: 'text-green-700',  light: 'bg-green-100',  hex: '#22c55e' },
  DBA:                     { bar: 'bg-blue-500',   text: 'text-blue-700',   light: 'bg-blue-100',   hex: '#3b82f6' },
  PhD:                     { bar: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100', hex: '#a855f7' },
  'Honorary Doctorate':    { bar: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-100', hex: '#eab308' },
};

const QUAL_COLOR = ['bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-yellow-400', 'bg-pink-400', 'bg-indigo-400'];

// ─── Skeleton blocks ──────────────────────────────────────────────────────────
function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;
}

// ─── Simple inline bar chart (no external lib) ────────────────────────────────
function BarChart({ data, color, maxValue }) {
  const max = maxValue || Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {data.map((d, i) => {
        const pct = max > 0 ? (d.count / max) * 100 : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity
                            bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none z-10">
              {d.date}: {d.count}
            </div>
            <div
              className={`w-full rounded-t ${color} transition-all duration-500`}
              style={{ height: `${Math.max(pct, d.count > 0 ? 4 : 0)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Horizontal percentage bar ────────────────────────────────────────────────
function DistBar({ label, count, total, colorClass, textClass, lightClass, icon }) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 flex items-center gap-1.5">
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${lightClass} ${textClass} text-xs font-bold`}>
            {icon}
          </span>
          {label}
        </span>
        <span className={`font-bold ${textClass}`}>{count} <span className="font-normal text-gray-400 text-xs">({pct}%)</span></span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, gradient }) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-extrabold">{value}</p>
          {sub && <p className="text-white/70 text-xs mt-1">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Analytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await axios.get(`${API_URL}/api/analytics`);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Derived values
  const topRec = data
    ? Object.entries(data.byRecommendation).sort(([, a], [, b]) => b - a)[0]
    : null;

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayCount = data?.dailyTrend?.find((d) => d.date === todayKey)?.count ?? 0;

  const last7 = data?.dailyTrend?.slice(-7).reduce((s, d) => s + d.count, 0) ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Insights and trends across all recommendation submissions.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchAnalytics} disabled={loading} className="btn-secondary text-sm">
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link to="/submissions" className="btn-primary text-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Submissions
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 mb-6">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold text-sm">Failed to load analytics</p>
            <p className="text-sm mt-0.5 text-red-600">{error}</p>
            <button onClick={fetchAnalytics} className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-900">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-28" />)
        ) : (
          <>
            <KpiCard label="Total Submissions"  value={data?.total ?? 0}   icon="📊" gradient="from-blue-500 to-blue-700"   />
            <KpiCard label="Today"              value={todayCount}         icon="📅" gradient="from-indigo-500 to-indigo-700" />
            <KpiCard label="Last 7 days"        value={last7}              icon="📈" gradient="from-purple-500 to-purple-700" />
            <KpiCard
              label="Top programme"
              value={topRec ? topRec[0] : '—'}
              sub={topRec ? `${topRec[1]} submission${topRec[1] !== 1 ? 's' : ''}` : undefined}
              icon="🏅"
              gradient="from-green-500 to-green-700"
            />
          </>
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Recommendation distribution */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-5">Recommendation Distribution</h2>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-8" />)}
            </div>
          ) : data?.total === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(data.byRecommendation).map(([rec, count]) => {
                const c = REC_COLOR[rec] || { bar: 'bg-gray-400', text: 'text-gray-700', light: 'bg-gray-100', hex: '#9ca3af' };
                return (
                  <DistBar
                    key={rec}
                    label={rec}
                    count={count}
                    total={data.total}
                    colorClass={c.bar}
                    textClass={c.text}
                    lightClass={c.light}
                    icon={{ 'Certification Program': '🎓', DBA: '💼', PhD: '🔬', 'Honorary Doctorate': '🏆' }[rec] || '📚'}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Qualification breakdown */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-800 mb-5">Submissions by Qualification</h2>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-8" />)}
            </div>
          ) : !data || Object.keys(data.byQualification || {}).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(data.byQualification)
                .sort(([, a], [, b]) => b - a)
                .map(([qual, count], i) => {
                  const pct = data.total > 0 ? ((count / data.total) * 100).toFixed(1) : '0.0';
                  return (
                    <div key={qual} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{qual}</span>
                        <span className="font-bold text-gray-800">
                          {count} <span className="font-normal text-gray-400 text-xs">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${QUAL_COLOR[i % QUAL_COLOR.length]} rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Daily trend chart */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-800">Daily Submissions — Last 30 Days</h2>
          {!loading && data && (
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              Total: {data.dailyTrend.reduce((s, d) => s + d.count, 0)}
            </span>
          )}
        </div>
        {loading ? (
          <SkeletonBlock className="h-36" />
        ) : !data || data.total === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No activity yet</p>
        ) : (
          <>
            <BarChart data={data.dailyTrend} color="bg-blue-500" />
            {/* X-axis labels — show every 5th day */}
            <div className="flex mt-2">
              {data.dailyTrend.map((d, i) => (
                <div key={i} className="flex-1 text-center">
                  {i % 5 === 0 && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Avg experience per recommendation */}
      <div className="card">
        <h2 className="text-base font-bold text-gray-800 mb-5">Avg. Years of Experience by Programme</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-20" />)}
          </div>
        ) : !data || Object.keys(data.avgExperienceByRecommendation || {}).length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(data.avgExperienceByRecommendation).map(([rec, avg]) => {
              const c = REC_COLOR[rec] || { light: 'bg-gray-100', text: 'text-gray-700' };
              const icon = { 'Certification Program': '🎓', DBA: '💼', PhD: '🔬', 'Honorary Doctorate': '🏆' }[rec] || '📚';
              return (
                <div key={rec} className={`rounded-xl ${c.light} p-4 text-center`}>
                  <div className="text-2xl mb-1">{icon}</div>
                  <p className={`text-2xl font-extrabold ${c.text}`}>{avg}</p>
                  <p className="text-xs text-gray-500 mt-0.5">yrs avg</p>
                  <p className="text-xs text-gray-600 font-medium mt-1 leading-tight">{rec}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
