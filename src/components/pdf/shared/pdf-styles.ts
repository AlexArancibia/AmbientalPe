import { StyleSheet } from '@react-pdf/renderer';

const HEX_COLOR_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const DEFAULT_PRIMARY = '#1e3a8a';
const DEFAULT_SECONDARY = '#6b21a8';

const basePalette = {
  primary: DEFAULT_PRIMARY,
  primaryLight: '#3b82f6',
  secondary: '#64748b',
  success: '#166534',
  successBg: '#dcfce7',
  warning: '#92400e',
  warningBg: '#fef3c7',
  danger: '#991b1b',
  dangerBg: '#fee2e2',
  info: '#1e40af',
  infoBg: '#dbeafe',
  purple: '#6b21a8',
  purpleBg: '#e9d5ff',
  gray: '#f8fafc',
  grayDark: '#475569',
  border: '#e2e8f0',
  white: '#ffffff',
  black: '#000000',
  text: '#1e293b',
};

type BasePalette = typeof basePalette;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeHex = (color?: string | null): string | null => {
  if (!color) return null;
  const match = HEX_COLOR_REGEX.exec(color);
  if (!match) return null;
  const hex = match[1]!;
  if (hex.length === 3) {
    return hex
      .split('')
      .map((char) => char + char)
      .join('')
      .toUpperCase();
  }
  return hex.toUpperCase();
};

const sanitizeColor = (color: string | null | undefined, fallback: string) => {
  const normalized = normalizeHex(color);
  return normalized ? `#${normalized}` : fallback;
};

const lightenColor = (color: string, amount: number) => {
  const normalized = normalizeHex(color);
  if (!normalized) {
    return color;
  }

  const ratio = clamp(amount, 0, 1);
  const num = parseInt(normalized, 16);

  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  const lightenChannel = (channel: number) =>
    Math.round(channel + (255 - channel) * ratio);

  const toHex = (channel: number) =>
    channel.toString(16).padStart(2, '0').toUpperCase();

  return `#${toHex(lightenChannel(r))}${toHex(lightenChannel(g))}${toHex(
    lightenChannel(b),
  )}`;
};

export type PdfPalette = BasePalette;

const buildPalette = (
  primaryColor?: string | null,
  secondaryColor?: string | null,
): PdfPalette => {
  const primary = sanitizeColor(primaryColor, DEFAULT_PRIMARY);
  const secondary = sanitizeColor(secondaryColor, DEFAULT_SECONDARY);

  return {
    ...basePalette,
    primary,
    primaryLight: lightenColor(primary, 0.35),
    secondary,
    info: secondary,
    infoBg: lightenColor(secondary, 0.88),
    purple: secondary,
    purpleBg: lightenColor(secondary, 0.92),
  };
};

const createStyles = (palette: PdfPalette) =>
  StyleSheet.create({
    // Página
    page: {
      padding: 30,
      fontSize: 9,
      fontFamily: 'Helvetica',
      color: palette.text,
    },

    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
      borderBottom: `2 solid ${palette.primary}`,
      paddingBottom: 12,
    },
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      flex: 1,
      alignItems: 'flex-end',
    },
    logoContainer: {
      width: 90,
      height: 40,
      marginBottom: 8,
      backgroundColor: palette.primary,
      borderRadius: 6,
      padding: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
    companyName: {
      fontSize: 11,
      fontWeight: 'bold',
      color: palette.primary,
      marginBottom: 2,
    },
    companyInfo: {
      fontSize: 8,
      color: palette.secondary,
      marginBottom: 1,
    },

    // Títulos
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: palette.primary,
      marginBottom: 3,
    },
    subtitle: {
      fontSize: 11,
      color: palette.secondary,
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: palette.primary,
      marginBottom: 8,
      marginTop: 10,
      borderBottom: `1 solid ${palette.border}`,
      paddingBottom: 4,
    },

    // Información de documento
    documentInfo: {
      fontSize: 9,
      marginBottom: 3,
    },
    documentInfoLabel: {
      fontWeight: 'bold',
      color: palette.grayDark,
    },
    documentInfoValue: {
      color: palette.text,
    },

    // Secciones
    section: {
      marginBottom: 15,
    },
    summarySection: {
      marginBottom: 15,
      padding: 10,
      backgroundColor: palette.gray,
      borderRadius: 4,
      border: `1 solid ${palette.border}`,
    },

    // Rows y columnas
    row: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    col: {
      flex: 1,
    },
    col2: {
      flex: 2,
    },
    col3: {
      flex: 3,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    summaryLabel: {
      fontWeight: 'bold',
      color: palette.grayDark,
      fontSize: 9,
    },
    summaryValue: {
      color: palette.primary,
      fontWeight: 'bold',
      fontSize: 9,
    },

    // Labels y valores
    label: {
      fontWeight: 'bold',
      color: palette.grayDark,
      fontSize: 9,
      marginBottom: 2,
    },
    value: {
      color: palette.text,
      fontSize: 9,
    },

    // Tablas
    table: {
      width: '100%',
      marginTop: 8,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: palette.primary,
      color: palette.white,
      padding: 6,
      fontWeight: 'bold',
      fontSize: 8,
    },
    tableRow: {
      flexDirection: 'row',
      padding: 6,
      borderBottom: `1 solid ${palette.border}`,
      fontSize: 8,
    },
    tableRowAlt: {
      flexDirection: 'row',
      padding: 6,
      backgroundColor: palette.gray,
      borderBottom: `1 solid ${palette.border}`,
      fontSize: 8,
    },
    tableCell: {
      fontSize: 8,
    },

    // Badges de estado
    badge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
      fontSize: 7,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgePending: {
      backgroundColor: palette.warningBg,
      color: palette.warning,
    },
    badgeInProgress: {
      backgroundColor: palette.infoBg,
      color: palette.info,
    },
    badgeCompleted: {
      backgroundColor: palette.successBg,
      color: palette.success,
    },
    badgeCancelled: {
      backgroundColor: palette.dangerBg,
      color: palette.danger,
    },
    badgeApproved: {
      backgroundColor: palette.purpleBg,
      color: palette.purple,
    },
    badgeDraft: {
      backgroundColor: palette.gray,
      color: palette.grayDark,
    },

    // Cuentas bancarias
    bankSection: {
      marginTop: 12,
      padding: 8,
      backgroundColor: palette.gray,
      borderRadius: 4,
      border: `1 solid ${palette.border}`,
    },
    bankSectionTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: palette.primary,
      marginBottom: 6,
    },
    bankAccountGrid: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    bankAccountCard: {
      flexBasis: '48%',
      flexGrow: 1,
      backgroundColor: palette.white,
      borderRadius: 4,
      border: `1 solid ${palette.border}`,
      padding: 6,
    },
    bankAccountLabel: {
      fontSize: 7,
      fontWeight: 'bold',
      color: palette.info,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    bankAccountItem: {
      marginBottom: 2,
    },
    bankAccountLine: {
      fontSize: 7,
      color: palette.grayDark,
      lineHeight: 1.3,
    },

    // Totales
    totalsSection: {
      marginTop: 15,
      alignItems: 'flex-end',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: 200,
      marginBottom: 3,
      paddingHorizontal: 10,
    },
    totalLabel: {
      fontSize: 9,
      color: palette.grayDark,
    },
    totalValue: {
      fontSize: 9,
      fontWeight: 'bold',
      color: palette.text,
    },
    totalFinal: {
      backgroundColor: palette.primary,
      color: palette.white,
      padding: 6,
      borderRadius: 3,
      marginTop: 3,
    },
    totalFinalLabel: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    totalFinalValue: {
      fontSize: 11,
      fontWeight: 'bold',
    },

    // Notas y comentarios
    notesSection: {
      marginTop: 15,
      padding: 10,
      backgroundColor: palette.warningBg,
      borderLeft: `3 solid ${palette.warning}`,
    },
    notesTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: palette.warning,
      marginBottom: 5,
    },
    notesText: {
      fontSize: 8,
      color: palette.grayDark,
      lineHeight: 1.4,
    },

    // Empty state
    emptyState: {
      padding: 20,
      textAlign: 'center',
      color: palette.secondary,
      fontSize: 10,
    },

    // Footer
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 30,
      right: 30,
      textAlign: 'center',
      color: palette.secondary,
      fontSize: 7,
      borderTop: `1 solid ${palette.border}`,
      paddingTop: 8,
    },
    footerText: {
      marginBottom: 2,
    },
    footerCompanyInfo: {
      fontSize: 7,
      color: palette.secondary,
      marginTop: 3,
    },

    // Número de página
    pageNumber: {
      position: 'absolute',
      fontSize: 8,
      bottom: 15,
      right: 30,
      color: palette.secondary,
    },

    // Divisores
    divider: {
      borderBottom: `1 solid ${palette.border}`,
      marginVertical: 10,
    },
    dividerBold: {
      borderBottom: `2 solid ${palette.primary}`,
      marginVertical: 10,
    },

    // Texto
    textBold: {
      fontWeight: 'bold',
    },
    textSmall: {
      fontSize: 7,
    },
    textMuted: {
      color: palette.secondary,
    },
    textCenter: {
      textAlign: 'center',
    },
    textRight: {
      textAlign: 'right',
    },
  });

export interface PdfThemeOptions {
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export const createPdfTheme = (options?: PdfThemeOptions) => {
  const palette = buildPalette(options?.primaryColor, options?.secondaryColor);
  return {
    colors: palette,
    styles: createStyles(palette),
  };
};

export type PdfTheme = ReturnType<typeof createPdfTheme>;

export const defaultPdfTheme = createPdfTheme();
export const colors = defaultPdfTheme.colors;
export const commonStyles = defaultPdfTheme.styles;
export type BadgeStyle = PdfTheme['styles']['badgePending'];

// Utilidades para formatear
export const formatUtils = {
  currency: (amount: number, currency: string = 'PEN') => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  },

  date: (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  },

  dateLong: (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  currentDate: () => {
    return new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
};

