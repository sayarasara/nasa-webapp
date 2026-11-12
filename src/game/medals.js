export const MEDALS = {
  gold: { label: 'Gold', color: '#f5c451', className: 'border-amber-300/50 bg-amber-300/10 text-amber-200' },
  silver: { label: 'Silver', color: '#c7d2e0', className: 'border-slate-300/50 bg-slate-300/10 text-slate-200' },
  bronze: { label: 'Bronze', color: '#d99669', className: 'border-orange-300/50 bg-orange-300/10 text-orange-200' },
}

export function medalForScore(score) {
  if (score >= 90) return 'gold'
  if (score >= 75) return 'silver'
  if (score >= 60) return 'bronze'
  return null
}

export function bestMedal(current, earned) {
  const rank = { bronze: 1, silver: 2, gold: 3 }
  return (rank[current] || 0) > (rank[earned] || 0) ? current : earned
}
