import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './shared/PDFHeader';
import { PDFFooter } from './shared/PDFFooter';
import { commonStyles, formatUtils } from './shared/pdf-styles';

const styles = StyleSheet.create({
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

type BadgeStyle = typeof commonStyles.badgePending;

const statusMap: Record<string, { label: string; style: BadgeStyle }> = {
  available: { label: 'Disponible', style: commonStyles.badgeCompleted },
  in_use: { label: 'En uso', style: commonStyles.badgeInProgress },
  maintenance: { label: 'Mantenimiento', style: commonStyles.badgePending },
  inactive: { label: 'Inactivo', style: commonStyles.badgeDraft },
};

const resolveStatus = (status: string): { label: string; style: BadgeStyle } => {
  const key = status.toLowerCase();
  if (statusMap[key]) {
    return statusMap[key];
  }

  return { label: status.toUpperCase(), style: commonStyles.badgePending };
};

export const EquipmentListPDF: React.FC<EquipmentListPDFProps> = ({ equipment, filters, company }) => {
  const statusCounts = equipment.reduce<Record<string, number>>((acc, item) => {
    const key = item.status.toLowerCase();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <PDFHeader
          company={company}
          documentTitle="INVENTARIO DE EQUIPOS"
          documentDate={formatUtils.currentDate()}
          showCompanyInfo={false}
        />

        <View style={commonStyles.summarySection}>
          <View style={commonStyles.summaryRow}>
            <Text style={commonStyles.summaryLabel}>Total de Equipos:</Text>
            <Text style={commonStyles.summaryValue}>{equipment.length}</Text>
          </View>
          {Object.entries(statusCounts).map(([status, count]) => {
            const statusInfo = resolveStatus(status);
            return (
              <View key={status} style={commonStyles.summaryRow}>
                <Text style={commonStyles.summaryLabel}>{statusInfo.label}:</Text>
                <Text style={commonStyles.summaryValue}>{count}</Text>
              </View>
            );
          })}
          {filters?.type && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Tipo filtrado:</Text>
              <Text style={commonStyles.summaryValue}>{filters.type}</Text>
            </View>
          )}
          {filters?.status && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Estado filtrado:</Text>
              <Text style={commonStyles.summaryValue}>{resolveStatus(filters.status).label}</Text>
            </View>
          )}
          {filters?.search && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Búsqueda:</Text>
              <Text style={commonStyles.summaryValue}>{filters.search}</Text>
            </View>
          )}
        </View>

        {equipment.length > 0 ? (
          <>
            <Text style={commonStyles.sectionTitle}>DETALLE DE EQUIPOS</Text>
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={styles.colCode}>Código</Text>
                <Text style={styles.colName}>Nombre</Text>
                <Text style={styles.colType}>Tipo</Text>
                <Text style={styles.colStatus}>Estado</Text>
                <Text style={styles.colSerial}>N° Serie</Text>
                <Text style={styles.colDescription}>Descripción</Text>
              </View>
              {equipment.map((item, index) => {
                const statusInfo = resolveStatus(item.status);
                return (
                  <View
                    key={`${item.code}-${index}`}
                    style={index % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
                  >
                    <Text style={styles.colCode}>{item.code}</Text>
                    <Text style={styles.colName}>{item.name}</Text>
                    <Text style={styles.colType}>{item.type}</Text>
                    <View style={styles.colStatus}>
                      <View style={[commonStyles.badge, statusInfo.style]}>
                        <Text>{statusInfo.label}</Text>
                      </View>
                    </View>
                    <Text style={styles.colSerial}>{item.serialNumber || 'N/A'}</Text>
                    <Text style={styles.colDescription}>{item.description}</Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <View style={commonStyles.emptyState}>
            <Text>No hay equipos registrados para mostrar.</Text>
          </View>
        )}

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
          customText="Inventario generado automáticamente"
        />
      </Page>
    </Document>
  );
};

