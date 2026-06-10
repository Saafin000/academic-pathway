const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { sendRecommendationEmail } = require('../mailer');

// ---------------------------------------------------------------------------
// Recommendation engine
// ---------------------------------------------------------------------------

const LEADERSHIP_KW = [
  'leadership', 'leader', 'business', 'management', 'manager', 'executive',
  'director', 'strategy', 'strategic', 'entrepreneur', 'ceo', 'coo', 'cfo', 'mba',
  'corporate', 'operations', 'administration', 'c-suite',
];

const RESEARCH_KW = [
  'research', 'academic', 'academia', 'professor', 'lecturer', 'scientist',
  'phd', 'doctorate', 'university', 'scholar', 'study', 'publish', 'publication',
  'laboratory', 'lab', 'thesis', 'dissertation', 'peer-review', 'journal',
];

const SENIOR_KW = [
  'senior', 'leadership', 'leader', 'executive', 'director', 'impact',
  'industry', 'innovation', 'contribution', 'pioneer', 'expert', 'authority',
  'influence', 'legacy', 'decades', 'veteran',
];

/**
 * Returns { recommendation, explanation, roadmap[] } for a given profile.
 */
function buildRecommendation(qualification, yearsExperience, careerGoal) {
  const goal = (careerGoal || '').toLowerCase();
  const years = Number(yearsExperience);

  const hasLeadership = LEADERSHIP_KW.some((kw) => goal.includes(kw));
  const hasResearch   = RESEARCH_KW.some((kw) => goal.includes(kw));
  const hasSenior     = SENIOR_KW.some((kw) => goal.includes(kw));

  // Rule 1 — early-career bachelor
  if (qualification === 'Bachelor' && years < 2) {
    return {
      recommendation: 'Certification Program',
      explanation:
        "With a Bachelor's degree and less than 2 years of experience, a focused certification is the fastest way to gain specialist skills, boost your CV, and open doors to higher-level roles.",
      roadmap: [
        'Identify 2–3 industry-recognised certifications aligned with your profession (e.g. PMP, AWS, Google Analytics).',
        'Complete the certification within 3–6 months while working.',
        'Build a portfolio of 2–3 projects demonstrating the new skills.',
        'Apply for mid-level roles or seek a mentor in your target field.',
        'Re-evaluate your pathway in 2 years — a DBA or Master\'s may be the logical next step.',
      ],
    };
  }

  // Rule 2 — mid-career leadership track
  if (
    (qualification === 'Bachelor' || qualification === 'Master') &&
    years >= 2 && years <= 8 &&
    hasLeadership
  ) {
    return {
      recommendation: 'DBA',
      explanation:
        'Your combination of practical experience and leadership-oriented goals is exactly what a Doctor of Business Administration (DBA) is designed for. It bridges real-world management challenges with applied research, giving you the credentials and strategic depth to move into executive and C-suite positions.',
      roadmap: [
        'Research accredited DBA programmes (AACSB/EQUIS) that offer executive or part-time tracks.',
        'Prepare a strong statement of purpose linking your professional experience to your leadership goals.',
        'Secure employer sponsorship or identify scholarship options to manage tuition costs.',
        'Complete the taught modules (typically 1–2 years) while maintaining your current role.',
        'Choose a dissertation topic rooted in a real business problem you have encountered.',
        'Leverage your DBA network and research to transition into a senior executive or board-level position.',
      ],
    };
  }

  // Rule 3 — research and academic track
  if (qualification === 'Master' && hasResearch) {
    return {
      recommendation: 'PhD',
      explanation:
        "A Master's degree combined with clear research or academic aspirations is the classic entry point for a PhD. This pathway will allow you to contribute original knowledge to your field, publish peer-reviewed work, and build a career in academia or high-level R&D.",
      roadmap: [
        'Identify potential supervisors whose research aligns with your interests — reach out with a short research proposal.',
        'Apply to PhD programmes; target universities with strong research groups in your domain.',
        'Secure funding: look for fully-funded positions, research council grants, or assistantships.',
        'Complete coursework and qualifying exams in year 1–2.',
        'Conduct original research and publish at least one paper before submission.',
        'Defend your thesis and plan your post-doctoral or industry R&D career path.',
      ],
    };
  }

  // Rule 4 — distinguished career honorary track
  if (years > 15 && hasSenior) {
    return {
      recommendation: 'Honorary Doctorate',
      explanation:
        'With over 15 years of distinguished professional experience and demonstrated senior leadership or industry impact, you are a strong candidate for an Honorary Doctorate. This recognition is awarded for sustained contributions to a field rather than formal academic study.',
      roadmap: [
        'Document your career achievements: publications, patents, keynotes, and measurable impact.',
        'Build relationships with university faculties and professional associations in your industry.',
        'Accept board, advisory, or visiting fellow roles at academic institutions to raise your academic profile.',
        'Engage with nominating bodies — many universities accept nominations from industry partners or alumni.',
        'Continue thought-leadership activities: books, speaking, mentoring, or industry panels.',
        'Be patient — Honorary Doctorates are awarded at the institution\'s discretion, typically to individuals with national/international recognition.',
      ],
    };
  }

  // Default fallback
  return {
    recommendation: 'Certification Program',
    explanation:
      'Based on your current profile, a professional certification programme is the most practical and high-ROI next step. It will sharpen your specialist skills, increase your market value, and keep your options open for further academic progression.',
    roadmap: [
      'Audit your current skills against job descriptions for your target role.',
      'Select 1–2 certifications with the highest employer recognition in your sector.',
      'Dedicate 5–10 hours per week to study alongside your current work.',
      'Join professional communities (LinkedIn groups, Slack channels) in your target area.',
      'After completing certifications, reassess whether a Master\'s or DBA aligns with your next 5-year plan.',
    ],
  };
}

// ---------------------------------------------------------------------------
// POST /api/recommendation
// ---------------------------------------------------------------------------
router.post('/recommendation', async (req, res) => {
  try {
    const { fullName, email, qualification, yearsExperience, profession, careerGoal } = req.body;

    // Validation
    if (!fullName || !email || !qualification || yearsExperience == null || !profession || !careerGoal) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (isNaN(Number(yearsExperience)) || Number(yearsExperience) < 0) {
      return res.status(400).json({ error: 'Years of experience must be a valid non-negative number.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const { recommendation, explanation, roadmap } = buildRecommendation(
      qualification,
      yearsExperience,
      careerGoal,
    );

    // Persist to Supabase
    const { data, error: dbError } = await supabase
      .from('submissions')
      .insert([{
        full_name:        fullName,
        email,
        qualification,
        years_experience: Number(yearsExperience),
        profession,
        career_goal:      careerGoal,
        recommendation,
        explanation,
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return res.status(500).json({ error: 'Failed to save submission. Please try again.' });
    }

    // Fire-and-forget email notification (non-blocking)
    sendRecommendationEmail({ fullName, email, recommendation, explanation, roadmap }).catch(
      (err) => console.error('Email notification failed (non-blocking):', err.message),
    );

    return res.status(201).json({
      message: 'Recommendation generated successfully.',
      recommendation,
      explanation,
      roadmap,
      submission: data,
    });
  } catch (err) {
    console.error('Unexpected error in POST /recommendation:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/submissions
// ---------------------------------------------------------------------------
router.get('/submissions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch submissions. Please try again.' });
    }

    return res.status(200).json({ submissions: data });
  } catch (err) {
    console.error('Unexpected error in GET /submissions:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/analytics
// ---------------------------------------------------------------------------
router.get('/analytics', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('recommendation, qualification, years_experience, created_at');

    if (error) {
      console.error('Supabase analytics fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics data.' });
    }

    const total = data.length;

    // Distribution by recommendation type
    const byRecommendation = {
      'Certification Program': 0,
      DBA: 0,
      PhD: 0,
      'Honorary Doctorate': 0,
    };
    data.forEach((row) => {
      if (byRecommendation[row.recommendation] !== undefined) {
        byRecommendation[row.recommendation] += 1;
      }
    });

    // Distribution by qualification
    const byQualification = {};
    data.forEach((row) => {
      byQualification[row.qualification] = (byQualification[row.qualification] || 0) + 1;
    });

    // Submissions per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyMap = {};
    data.forEach((row) => {
      const d = new Date(row.created_at);
      if (d >= thirtyDaysAgo) {
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        dailyMap[key] = (dailyMap[key] || 0) + 1;
      }
    });

    // Fill missing days with 0 so the chart is contiguous
    const dailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyTrend.push({ date: key, count: dailyMap[key] || 0 });
    }

    // Average experience by recommendation
    const expSums   = {};
    const expCounts = {};
    data.forEach((row) => {
      expSums[row.recommendation]   = (expSums[row.recommendation]   || 0) + row.years_experience;
      expCounts[row.recommendation] = (expCounts[row.recommendation] || 0) + 1;
    });
    const avgExperienceByRecommendation = {};
    Object.keys(expSums).forEach((k) => {
      avgExperienceByRecommendation[k] = parseFloat(
        (expSums[k] / expCounts[k]).toFixed(1),
      );
    });

    return res.status(200).json({
      total,
      byRecommendation,
      byQualification,
      dailyTrend,
      avgExperienceByRecommendation,
    });
  } catch (err) {
    console.error('Unexpected error in GET /analytics:', err);
    return res.status(500).json({ error: 'An unexpected error occurred.' });
  }
});

module.exports = router;
