export function getDepartmentColor(department: string) {
  const normalized = department === 'Collaboration' ? 'A&W' : department;
  const colors: { [key: string]: { bg: string; text: string; border: string } } = {
    'Event Prep': {
      bg: 'bg-gradient-to-r from-slate-800/20 to-slate-700/20 dark:from-slate-700/30 dark:to-slate-600/30',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-l-slate-600 dark:border-l-slate-400',
    },
    'Internal': {
      bg: 'bg-gradient-to-r from-violet-900/20 to-violet-800/20 dark:from-violet-800/30 dark:to-violet-700/30',
      text: 'text-violet-700 dark:text-violet-300',
      border: 'border-l-violet-600 dark:border-l-violet-400',
    },
    'Public Holiday': {
      bg: 'bg-gradient-to-r from-rose-900/20 to-rose-800/20 dark:from-rose-800/30 dark:to-rose-700/30',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-l-rose-600 dark:border-l-rose-400',
    },
    'SPR': {
      bg: 'bg-gradient-to-r from-emerald-900/20 to-emerald-800/20 dark:from-emerald-800/30 dark:to-emerald-700/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-l-emerald-600 dark:border-l-emerald-400',
    },
    'A&W': {
      bg: 'bg-gradient-to-r from-amber-900/20 to-amber-800/20 dark:from-amber-800/30 dark:to-amber-700/30',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-l-amber-600 dark:border-l-amber-400',
    },
    'Execution': {
      bg: 'bg-gradient-to-r from-indigo-900/20 to-indigo-800/20 dark:from-indigo-800/30 dark:to-indigo-700/30',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-l-indigo-600 dark:border-l-indigo-400',
    },
    'Flagship': {
      bg: 'bg-gradient-to-r from-fuchsia-900/20 to-fuchsia-800/20 dark:from-fuchsia-800/30 dark:to-fuchsia-700/30',
      text: 'text-fuchsia-700 dark:text-fuchsia-300',
      border: 'border-l-fuchsia-600 dark:border-l-fuchsia-400',
    },
  };

  return colors[normalized] || {
    bg: 'bg-gradient-to-r from-gray-800/20 to-gray-700/20 dark:from-gray-700/30 dark:to-gray-600/30',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-l-gray-600 dark:border-l-gray-400',
  };
}
