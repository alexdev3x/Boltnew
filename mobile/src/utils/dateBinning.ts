import type { ChatHistoryItem } from '../store/chatStore';

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function binDates(list: ChatHistoryItem[]) {
  const now = startOfDay(new Date());
  const bins = new Map<string, ChatHistoryItem[]>();

  const sorted = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  for (const item of sorted) {
    const created = startOfDay(new Date(item.createdAt));
    const diffDays = Math.round((+now - +created) / (1000 * 60 * 60 * 24));
    let category = 'Older';

    if (diffDays === 0) category = 'Today';
    else if (diffDays === 1) category = 'Yesterday';
    else if (diffDays < 7) category = 'Last 7 Days';
    else if (diffDays < 30) category = 'Last 30 Days';

    const items = bins.get(category) ?? [];
    items.push(item);
    bins.set(category, items);
  }

  return [...bins.entries()].map(([category, items]) => ({ category, items }));
}
