import { StyleSheet } from '@react-pdf/renderer';

// Paleta de colores estandarizada
export const colors = {
  primary: '#1e3a8a', // Azul oscuro principal
  primaryLight: '#3b82f6', // Azul más claro
  secondary: '#64748b', // Gris para texto secundario
  success: '#166534', // Verde
  successBg: '#dcfce7',
  warning: '#92400e', // Amarillo/Naranja oscuro
  warningBg: '#fef3c7',
  danger: '#991b1b', // Rojo
  dangerBg: '#fee2e2',
  info: '#1e40af', // Azul
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

// Estilos comunes estandarizados para todos los PDFs
export const commonStyles = StyleSheet.create({
  // Página
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: colors.text,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottom: `2 solid ${colors.primary}`,
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
    backgroundColor: colors.primary,
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
    color: colors.primary,
    marginBottom: 2,
  },
  companyInfo: {
    fontSize: 8,
    color: colors.secondary,
    marginBottom: 1,
  },
  
  // Títulos
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 11,
    color: colors.secondary,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    marginTop: 10,
    borderBottom: `1 solid ${colors.border}`,
    paddingBottom: 4,
  },

  // Información de documento
  documentInfo: {
    fontSize: 9,
    marginBottom: 3,
  },
  documentInfoLabel: {
    fontWeight: 'bold',
    color: colors.grayDark,
  },
  documentInfoValue: {
    color: colors.text,
  },

  // Secciones
  section: {
    marginBottom: 15,
  },
  summarySection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: colors.gray,
    borderRadius: 4,
    border: `1 solid ${colors.border}`,
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
    color: colors.grayDark,
    fontSize: 9,
  },
  summaryValue: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 9,
  },

  // Labels y valores
  label: {
    fontWeight: 'bold',
    color: colors.grayDark,
    fontSize: 9,
    marginBottom: 2,
  },
  value: {
    color: colors.text,
    fontSize: 9,
  },

  // Tablas
  table: {
    width: '100%',
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    color: colors.white,
    padding: 6,
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: `1 solid ${colors.border}`,
    fontSize: 8,
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: colors.gray,
    borderBottom: `1 solid ${colors.border}`,
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
    backgroundColor: colors.warningBg,
    color: colors.warning,
  },
  badgeInProgress: {
    backgroundColor: colors.infoBg,
    color: colors.info,
  },
  badgeCompleted: {
    backgroundColor: colors.successBg,
    color: colors.success,
  },
  badgeCancelled: {
    backgroundColor: colors.dangerBg,
    color: colors.danger,
  },
  badgeApproved: {
    backgroundColor: colors.purpleBg,
    color: colors.purple,
  },
  badgeDraft: {
    backgroundColor: colors.gray,
    color: colors.grayDark,
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
    color: colors.grayDark,
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalFinal: {
    backgroundColor: colors.primary,
    color: colors.white,
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
    backgroundColor: colors.warningBg,
    borderLeft: `3 solid ${colors.warning}`,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.warning,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 8,
    color: colors.grayDark,
    lineHeight: 1.4,
  },

  // Empty state
  emptyState: {
    padding: 20,
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 10,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: colors.secondary,
    fontSize: 7,
    borderTop: `1 solid ${colors.border}`,
    paddingTop: 8,
  },
  footerText: {
    marginBottom: 2,
  },
  footerCompanyInfo: {
    fontSize: 7,
    color: colors.secondary,
    marginTop: 3,
  },
  
  // Número de página
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 15,
    right: 30,
    color: colors.secondary,
  },

  // Divisores
  divider: {
    borderBottom: `1 solid ${colors.border}`,
    marginVertical: 10,
  },
  dividerBold: {
    borderBottom: `2 solid ${colors.primary}`,
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
    color: colors.secondary,
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
});

export type BadgeStyle = typeof commonStyles.badgePending;

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

