export const C = {
  indigo600: '#4F46E5',
  indigo500: '#6366F1',
  indigo50:  '#EEF2FF',
  indigo100: '#E0E7FF',
  violet600: '#7C3AED',
  violet50:  '#F5F3FF',
  slate900:  '#0F172A',
  slate700:  '#334155',
  slate500:  '#64748B',
  slate400:  '#94A3B8',
  slate200:  '#E2E8F0',
  slate100:  '#F1F5F9',
  slate50:   '#F8FAFC',
  success:   '#059669',
  successLight: '#ECFDF5',
  successBorder: '#A7F3D0',
  warning:   '#D97706',
  warningLight: '#FFFBEB',
  warningBorder: '#FDE68A',
  danger:    '#DC2626',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FECACA',
};

export const CHART_PALETTE = [
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#0284C7', // Sky
  '#E11D48', // Rose
  '#D946EF', // Fuchsia
  '#0D9488', // Teal
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
      return C.indigo600;
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
      return C.indigo50;
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
      return C.indigo100;
  }
}
