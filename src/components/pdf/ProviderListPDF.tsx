import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './shared/PDFHeader';
import { PDFFooter } from './shared/PDFFooter';
import { commonStyles, formatUtils } from './shared/pdf-styles';

const styles = StyleSheet.create({
  colName: { width: '28%' },
  colRuc: { width: '15%' },
  colEmail: { width: '20%' },
  colAddress: { width: '22%' },
  colContact: { width: '15%' },
});

interface CompanySummary {
  name: string;
  ruc: string;
  address: string;
  email: string;
  phone: string;
  logo?: string | null;
}

interface ProviderListPDFProps {
  providers: Array<{
    name: string;
    ruc: string;
    email: string;
    address: string;
    contactPerson?: string | null;
  }>;
  filters?: {
    search?: string;
  };
  company?: CompanySummary;
}

export const ProviderListPDF: React.FC<ProviderListPDFProps> = ({ providers, filters, company }) => {
  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <PDFHeader
          company={company}
          documentTitle="LISTA DE PROVEEDORES"
          documentDate={formatUtils.currentDate()}
          showCompanyInfo={false}
        />

        <View style={commonStyles.summarySection}>
          <View style={commonStyles.summaryRow}>
            <Text style={commonStyles.summaryLabel}>Total de Proveedores:</Text>
            <Text style={commonStyles.summaryValue}>{providers.length}</Text>
          </View>
          {filters?.search && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Búsqueda:</Text>
              <Text style={commonStyles.summaryValue}>{filters.search}</Text>
            </View>
          )}
        </View>

        {providers.length > 0 ? (
          <>
            <Text style={commonStyles.sectionTitle}>DETALLE DE PROVEEDORES</Text>
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={styles.colName}>Nombre / Razón Social</Text>
                <Text style={styles.colRuc}>RUC</Text>
                <Text style={styles.colEmail}>Email</Text>
                <Text style={styles.colAddress}>Dirección</Text>
                <Text style={styles.colContact}>Contacto</Text>
              </View>
              {providers.map((provider, index) => (
                <View
                  key={`${provider.ruc}-${index}`}
                  style={index % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
                >
                  <Text style={styles.colName}>{provider.name}</Text>
                  <Text style={styles.colRuc}>{provider.ruc}</Text>
                  <Text style={styles.colEmail}>{provider.email}</Text>
                  <Text style={styles.colAddress}>{provider.address}</Text>
                  <Text style={styles.colContact}>{provider.contactPerson || '-'}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={commonStyles.emptyState}>
            <Text>No hay proveedores registrados para mostrar.</Text>
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
        />
      </Page>
    </Document>
  );
};

