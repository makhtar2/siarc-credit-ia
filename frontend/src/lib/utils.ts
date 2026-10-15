export const C = {
  black:     '#18181B',
  slate900:  '#0F172A',
  slate700:  '#334155',
  slate500:  '#64748B',
  slate400:  '#94A3B8',
  slate200:  '#E2E8F0',
  slate100:  '#F1F5F9',
  slate50:   '#F8FAFC',
  success:   '#10B981',
  successLight: '#ECFDF5',
  successBorder: '#A7F3D0',
  warning:   '#F59E0B',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',
  danger:    '#EF4444',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',
};

export const CHART_PALETTE = [
  '#18181B', // Obsidian Black
  '#3F3F46', // Charcoal
  '#71717A', // Slate Gray
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Rose
  '#A1A1AA', // Silver
  '#27272A', // Dark Slate
];

export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}

export function fmtFCFA(n: number | null | undefined): string {
  return `${fmt(n)} FCFA`;
}

export function fmtDecimal(n: number | null | undefined, digits: number = 2): string {
  if (n === null || n === undefined || isNaN(n)) return '0.00';
  return n.toLocaleString('fr-FR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function fmtPct(n: number | null | undefined, digits: number = 1): string {
  if (n === null || n === undefined || isNaN(n)) return '0%';
  return `${fmtDecimal(n, digits)}%`;
}

export function statusColor(status: string): string {
  switch (status) {
    case 'Sain':
      return C.success;
    case 'Vigilance':
      return C.warning;
    case 'Défaut':
      return C.danger;
    default:
      return C.black;
  }
}

export function statusLightColor(status: string): string {
  switch (status) {
    case 'Sain':
      return C.successLight;
    case 'Vigilance':
      return C.warningLight;
    case 'Défaut':
      return C.dangerLight;
    default:
      return '#F4F4F5';
  }
}

export function statusBorderColor(status: string): string {
  switch (status) {
    case 'Sain':
      return C.successBorder;
    case 'Vigilance':
      return C.warningBorder;
    case 'Défaut':
      return C.dangerBorder;
    default:
      return '#E4E4E7';
  }
}
