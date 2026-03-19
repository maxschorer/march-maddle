export function getPSTDate(): string {
  const pstDate = new Date().toLocaleDateString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/');
  
  return `${pstDate[2]}-${pstDate[0]}-${pstDate[1]}`; // Convert MM/DD/YYYY to YYYY-MM-DD
}

export function getPSTYesterday(): string {
  const now = new Date();
  const pstDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  pstDate.setDate(pstDate.getDate() - 1);
  return pstDate.toISOString().split('T')[0];
}