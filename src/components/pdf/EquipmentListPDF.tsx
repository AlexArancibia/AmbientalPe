import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './shared/PDFHeader';
import { PDFFooter } from './shared/PDFFooter';
import { PDFBankAccountsSection, type PdfBankAccount } from './shared/PDFBankAccountsSection';
import { createPdfTheme, formatUtils } from './shared/pdf-styles';
import type { BadgeStyle } from './shared/pdf-styles';

const tableStyles = StyleSheet.create({
  colCode: { width: '12%' },
  colName: { width: '22%' },
  colType: { width: '18%' },
  colStatus: { width: '14%' },
  colSerial: { width: '14%' },
  colDescription: { width: '20%' },
});

interface CompanySummary {
  name: string;
  ruc: string;
  address: string;
  email: string;
  phone: string;
  logo?: string | null;
  bankAccounts?: PdfBankAccount[];
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

interface EquipmentListPDFProps {
  equipment: Array<{
    code: string;
    name: string;
    type: string;
    status: string;
    serialNumber?: string | null;
    description: string;
  }>;
  filters?: {
    type?: string;
    status?: string;
    search?: string;
  };
  company?: CompanySummary;
}

export const EquipmentListPDF: React.FC<EquipmentListPDFProps> = ({ equipment, filters, company }) => {
  const theme = createPdfTheme({
    primaryColor: company?.primaryColor,
    secondaryColor: company?.secondaryColor,
  });
  const styles = theme.styles;

  const statusStyles: Record<string, { label: string; style: BadgeStyle }> = {
    available: { label: 'Disponible', style: styles.badgeCompleted as BadgeStyle },
    in_use: { label: 'En uso', style: styles.badgeInProgress as BadgeStyle },
    maintenance: { label: 'Mantenimiento', style: styles.badgePending as BadgeStyle },
    inactive: { label: 'Inactivo', style: styles.badgeDraft as BadgeStyle },
  };

  const resolveStatus = (status: string): { label: string; style: BadgeStyle } => {
    const key = status.toLowerCase();
    if (statusStyles[key]) {
      return statusStyles[key];
    }

    return { label: status.toUpperCase(), style: styles.badgePending as BadgeStyle };
  };

  const statusCounts = equipment.reduce<Record<string, number>>((acc, item) => {
    const key = item.status.toLowerCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          company={company}
          documentTitle="INVENTARIO DE EQUIPOS"
          documentDate={formatUtils.currentDate()}
          showCompanyInfo={false}
          theme={theme}
        />

        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Equipos:</Text>
            <Text style={styles.summaryValue}>{equipment.length}</Text>
          </View>
          {Object.entries(statusCounts).map(([status, count]) => {
            const statusInfo = resolveStatus(status);
            return (
              <View key={status} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{statusInfo.label}:</Text>
                <Text style={styles.summaryValue}>{count}</Text>
              </View>
            );
          })}
          {filters?.type && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tipo filtrado:</Text>
              <Text style={styles.summaryValue}>{filters.type}</Text>
            </View>
          )}
          {filters?.status && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estado filtrado:</Text>
              <Text style={styles.summaryValue}>{resolveStatus(filters.status).label}</Text>
            </View>
          )}
          {filters?.search && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Búsqueda:</Text>
              <Text style={styles.summaryValue}>{filters.search}</Text>
            </View>
          )}
        </View>

        {equipment.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>DETALLE DE EQUIPOS</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={tableStyles.colCode}>Código</Text>
                <Text style={tableStyles.colName}>Nombre</Text>
                <Text style={tableStyles.colType}>Tipo</Text>
                <Text style={tableStyles.colStatus}>Estado</Text>
                <Text style={tableStyles.colSerial}>N° Serie</Text>
                <Text style={tableStyles.colDescription}>Descripción</Text>
              </View>
              {equipment.map((item, index) => {
                const statusInfo = resolveStatus(item.status);
                return (
                  <View
                    key={`${item.code}-${index}`}
                    style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                  >
                    <Text style={tableStyles.colCode}>{item.code}</Text>
                    <Text style={tableStyles.colName}>{item.name}</Text>
                    <Text style={tableStyles.colType}>{item.type}</Text>
                    <View style={tableStyles.colStatus}>
                      <View style={[styles.badge, statusInfo.style]}>
                        <Text>{statusInfo.label}</Text>
                      </View>
                    </View>
                    <Text style={tableStyles.colSerial}>{item.serialNumber || 'N/A'}</Text>
                    <Text style={tableStyles.colDescription}>{item.description}</Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text>No hay equipos registrados para mostrar.</Text>
          </View>
        )}

        <PDFBankAccountsSection accounts={company?.bankAccounts} theme={theme} />

        <PDFFooter
          company={
            company
              ? {
                  name: company.name,
                  email: company.email,
                  phone: company.phone,
                }
              : undefined
          }
          theme={theme}
        />
      </Page>
    </Document>
  );
};

