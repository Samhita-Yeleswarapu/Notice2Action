export function urgencyMeta(urgency) {
  switch (urgency) {
    case 'high':
      return { label: 'Act now', word: 'URGENT' };
    case 'medium':
      return { label: 'Coming up', word: 'NOTED' };
    case 'low':
      return { label: 'Plenty of time', word: 'ON TRACK' };
    default:
      return { label: 'No deadline stated', word: 'N/A' };
  }
}
