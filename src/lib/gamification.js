export const XP_REWARDS = {
  save_scholarship: 10,
  apply_scholarship: 50,
  complete_profile: 100,
  write_essay: 30,
  upload_document: 20,
  daily_login: 5,
  get_accepted: 200,
};

export const BADGES = [
  { id: 'first_save', label: 'First Save', emoji: '🔖', description: 'Saved your first scholarship', xpRequired: 0, condition: (stats) => stats.totalSaved >= 1 },
  { id: 'applicant', label: 'Applicant', emoji: '📝', description: 'Applied to your first scholarship', xpRequired: 0, condition: (stats) => stats.totalApplied >= 1 },
  { id: 'hustler', label: 'Hustler', emoji: '🚀', description: 'Applied to 5+ scholarships', xpRequired: 0, condition: (stats) => stats.totalApplied >= 5 },
  { id: 'essay_pro', label: 'Essay Pro', emoji: '✍️', description: 'Wrote 3+ essays', xpRequired: 0, condition: (stats) => stats.totalEssays >= 3 },
  { id: 'big_dreams', label: 'Big Dreams', emoji: '💰', description: 'Applied for $10k+', xpRequired: 0, condition: (stats) => stats.totalAppliedAmount >= 10000 },
  { id: 'scholar', label: 'Scholar', emoji: '🎓', description: 'Earned 500+ XP', xpRequired: 500, condition: (stats) => stats.xp >= 500 },
  { id: 'champion', label: 'Champion', emoji: '🏆', description: 'Won a scholarship', xpRequired: 0, condition: (stats) => stats.totalAccepted >= 1 },
  { id: 'dedicated', label: 'Dedicated', emoji: '🔥', description: '7-day streak', xpRequired: 0, condition: (stats) => stats.streak >= 7 },
];

export function calculateLevel(xp) {
  if (xp < 100) return { level: 1, title: 'Newcomer', next: 100 };
  if (xp < 300) return { level: 2, title: 'Explorer', next: 300 };
  if (xp < 600) return { level: 3, title: 'Applicant', next: 600 };
  if (xp < 1000) return { level: 4, title: 'Contender', next: 1000 };
  if (xp < 1500) return { level: 5, title: 'Scholar', next: 1500 };
  if (xp < 2500) return { level: 6, title: 'Elite', next: 2500 };
  return { level: 7, title: 'Champion', next: null };
}

export function computeStats(saved, scholarshipMap, essays) {
  const totalSaved = saved.length;
  const totalApplied = saved.filter(s => ['applied', 'accepted'].includes(s.status)).length;
  const totalAccepted = saved.filter(s => s.status === 'accepted').length;
  const totalEssays = essays?.length || 0;

  const totalAppliedAmount = saved
    .filter(s => ['applied', 'accepted'].includes(s.status))
    .reduce((sum, s) => {
      const sc = scholarshipMap[s.scholarship_id];
      return sum + (sc?.amount || 0);
    }, 0);

  const xp = (totalSaved * XP_REWARDS.save_scholarship)
    + (totalApplied * XP_REWARDS.apply_scholarship)
    + (totalEssays * XP_REWARDS.write_essay)
    + (totalAccepted * XP_REWARDS.get_accepted);

  return { totalSaved, totalApplied, totalAccepted, totalEssays, totalAppliedAmount, xp, streak: 0 };
}