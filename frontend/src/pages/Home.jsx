import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

const QUALIFICATION_OPTIONS = [
  { value: '',           label: 'Select your qualification' },
  { value: 'High School', label: 'High School'             },
  { value: 'Bachelor',    label: "Bachelor's Degree"       },
  { value: 'Master',      label: "Master's Degree"         },
  { value: 'PhD',         label: 'PhD'                     },
  { value: 'Other',       label: 'Other'                   },
];

const REC_STYLES = {
  'Certification Program': {
    border:    'border-green-300',
    bg:        'bg-green-50',
    badge:     'bg-green-100 text-green-800 border border-green-200',
    heading:   'text-green-800',
    accentBar: 'bg-green-500',
    stepBg:    'bg-green-100 text-green-700',
    icon:      '🎓',
  },
  DBA: {
    border:    'border-blue-300',
    bg:        'bg-blue-50',
    badge:     'bg-blue-100 text-blue-800 border border-blue-200',
    heading:   'text-blue-800',
    accentBar: 'bg-blue-500',
    stepBg:    'bg-blue-100 text-blue-700',
    icon:      '💼',
  },
  PhD: {
    border:    'border-purple-300',
    bg:        'bg-purple-50',
    badge:     'bg-purple-100 text-purple-800 border border-purple-200',
    heading:   'text-purple-800',
    accentBar: 'bg-purple-500',
    stepBg:    'bg-purple-100 text-purple-700',
    icon:      '🔬',
  },
  'Honorary Doctorate': {
    border:    'border-yellow-300',
    bg:        'bg-yellow-50',
    badge:     'bg-yellow-100 text-yellow-800 border border-yellow-200',
    heading:   'text-yellow-800',
    accentBar: 'bg-yellow-500',
    stepBg:    'bg-yellow-100 text-yellow-700',
    icon:      '🏆',
  },
};

// ─── Skeleton for form card ──────────────────────────────────────────────────
function FormSkeleton() {
  return (
    <div className="card animate-pulse space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-11 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-11 bg-gray-200 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-28 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-12 bg-gray-300 rounded-xl" />
    </div>
  );
}

// ─── Recommendation result card ──────────────────────────────────────────────
function ResultCard({ recommendation, explanation, roadmap, submissionName, onReset }) {
  const s = REC_STYLES[recommendation] || REC_STYLES['Certification Program'];

  return (
    <div className={`animate-slide-up rounded-2xl border-2 ${s.border} ${s.bg} overflow-hidden`}>
      {/* Top accent bar */}
      <div className={`h-1.5 w-full ${s.accentBar}`} />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Success header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">
            Hi <span className="font-semibold text-gray-700">{submissionName}</span>, your recommended pathway is
          </p>
          <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xl ${s.badge}`}>
            <span>{s.icon}</span>
            {recommendation}
          </span>
        </div>

        {/* Explanation */}
        <div>
          <h3 className={`font-bold text-sm uppercase tracking-wider mb-2 ${s.heading}`}>
            Why this recommendation?
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed bg-white/70 rounded-xl p-4 border border-white">
            {explanation}
          </p>
        </div>

        {/* Roadmap */}
        <div>
          <h3 className={`font-bold text-sm uppercase tracking-wider mb-3 ${s.heading}`}>
            Your roadmap
          </h3>
          <ol className="space-y-2">
            {roadmap.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 ${s.stepBg}`}>
                  {i + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button onClick={onReset} className="btn-primary flex-1">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Submit Another
          </button>
          <Link to="/submissions" className="btn-secondary flex-1 justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            All Submissions
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Form field wrapper ───────────────────────────────────────────────────────
function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Initial state ────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  fullName: '', email: '', qualification: '',
  yearsExperience: '', profession: '', careerGoal: '',
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function Home() {
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [result,      setResult]      = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim())        errs.fullName      = 'Full name is required.';
    if (!form.email.trim())           errs.email         = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                      errs.email         = 'Enter a valid email address.';
    if (!form.qualification)          errs.qualification = 'Please select your qualification.';
    if (form.yearsExperience === '')  errs.yearsExperience = 'Years of experience is required.';
    else if (Number(form.yearsExperience) < 0)
                                      errs.yearsExperience = 'Cannot be negative.';
    if (!form.profession.trim())      errs.profession    = 'Current profession is required.';
    if (!form.careerGoal.trim())      errs.careerGoal    = 'Career goal is required.';
    else if (form.careerGoal.trim().length < 20)
                                      errs.careerGoal    = 'Please write at least 20 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/recommendation`, {
        fullName:       form.fullName.trim(),
        email:          form.email.trim(),
        qualification:  form.qualification,
        yearsExperience: Number(form.yearsExperience),
        profession:     form.profession.trim(),
        careerGoal:     form.careerGoal.trim(),
      });
      setResult({
        recommendation: data.recommendation,
        explanation:    data.explanation,
        roadmap:        data.roadmap,
        fullName:       form.fullName.trim(),
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setError(null);
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
          Find Your{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Academic Pathway
          </span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
          Tell us about your background and career goals — we'll recommend the best academic programme for you.
        </p>
      </div>

      {/* Result */}
      {result ? (
        <ResultCard
          recommendation={result.recommendation}
          explanation={result.explanation}
          roadmap={result.roadmap}
          submissionName={result.fullName}
          onReset={handleReset}
        />
      ) : loading ? (
        <FormSkeleton />
      ) : (
        /* Form */
        <div className="card animate-fade-in">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Full Name" error={fieldErrors.fullName}>
                <input type="text" name="fullName" value={form.fullName}
                  onChange={handleChange} placeholder="e.g. Jane Doe"
                  autoComplete="name"
                  className={`form-input ${fieldErrors.fullName ? 'border-red-300 focus:ring-red-400' : ''}`} />
              </Field>

              <Field label="Email Address" error={fieldErrors.email}>
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="e.g. jane@example.com"
                  autoComplete="email"
                  className={`form-input ${fieldErrors.email ? 'border-red-300 focus:ring-red-400' : ''}`} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Highest Qualification" error={fieldErrors.qualification}>
                <select name="qualification" value={form.qualification} onChange={handleChange}
                  className={`form-input ${fieldErrors.qualification ? 'border-red-300 focus:ring-red-400' : ''}`}>
                  {QUALIFICATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} disabled={o.value === ''}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Years of Work Experience" error={fieldErrors.yearsExperience}>
                <input type="number" name="yearsExperience" value={form.yearsExperience}
                  onChange={handleChange} placeholder="e.g. 5" min="0" max="60"
                  className={`form-input ${fieldErrors.yearsExperience ? 'border-red-300 focus:ring-red-400' : ''}`} />
              </Field>
            </div>

            <Field label="Current Profession" error={fieldErrors.profession}>
              <input type="text" name="profession" value={form.profession}
                onChange={handleChange} placeholder="e.g. Software Engineer, Marketing Manager"
                className={`form-input ${fieldErrors.profession ? 'border-red-300 focus:ring-red-400' : ''}`} />
            </Field>

            <Field
              label="Career Goal"
              error={fieldErrors.careerGoal}
              hint='Tip: include keywords like "leadership", "research", "business" or "senior" for a sharper match.'
            >
              <textarea name="careerGoal" value={form.careerGoal} onChange={handleChange} rows={4}
                placeholder="Describe your career aspirations — e.g. I want to lead a research team, transition into business leadership, or pursue academic publishing..."
                className={`form-input resize-none ${fieldErrors.careerGoal ? 'border-red-300 focus:ring-red-400' : ''}`} />
            </Field>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get My Recommendation
            </button>
          </form>
        </div>
      )}

      {/* How it works */}
      {!result && !loading && (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📋', title: 'Fill the form',   desc: 'Share your background and career ambitions' },
            { icon: '🤖', title: 'Smart analysis',  desc: 'Our engine evaluates your profile against proven pathways' },
            { icon: '🎯', title: 'Get matched',     desc: 'Receive your recommendation, explanation, and roadmap' },
          ].map((item) => (
            <div key={item.title} className="card text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{item.title}</h3>
              <p className="text-gray-500 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
