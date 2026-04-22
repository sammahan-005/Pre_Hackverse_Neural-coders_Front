/**
 * Returns a human-readable relative time string in French.
 * e.g., "il y a 5 min", "il y a 2 jours", "à l'instant"
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHour < 24) return `il y a ${diffHour}h`;
  if (diffDay < 7) return `il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
  if (diffWeek < 5) return `il y a ${diffWeek} sem.`;
  if (diffMonth < 12) return `il y a ${diffMonth} mois`;

  const diffYear = Math.floor(diffDay / 365);
  return `il y a ${diffYear} an${diffYear > 1 ? 's' : ''}`;
}

/**
 * Returns a reputation level label and color based on score
 */
export function getReputationLevel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 5000) return { label: 'Expert', color: '#f59e0b', emoji: '🏆' };
  if (score >= 2000) return { label: 'Avancé', color: '#8b5cf6', emoji: '⭐' };
  if (score >= 500) return { label: 'Intermédiaire', color: '#06b6d4', emoji: '📚' };
  if (score >= 200) return { label: 'Contributeur', color: '#10b981', emoji: '✍️' };
  return { label: 'Débutant', color: '#94a3b8', emoji: '🌱' };
}
