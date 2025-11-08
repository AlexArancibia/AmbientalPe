import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './shared/PDFHeader';
import { PDFFooter } from './shared/PDFFooter';
import { PDFBankAccountsSection, type PdfBankAccount } from './shared/PDFBankAccountsSection';
import { createPdfTheme, formatUtils } from './shared/pdf-styles';

const styles = StyleSheet.create({
  colName: { width: '30%' },
  colRuc: { width: '15%' },
  colEmail: { width: '20%' },
  colAddress: { width: '35%' },
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

interface ClientListPDFProps {
  clients: Array<{
    name: string;
    ruc: string;
    email: string;
    address: string;
    type: string;
    contactPerson?: string | null;
  }>;
  filters?: {
    type?: string;
    search?: string;
  };
  company?: CompanySummary;
}

export const ClientListPDF: React.FC<ClientListPDFProps> = ({ clients, filters, company }) => {
  const theme = createPdfTheme({
    primaryColor: company?.primaryColor,
    secondaryColor: company?.secondaryColor,
  });
  const commonStyles = theme.styles;

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <PDFHeader
          company={company}
          documentTitle="LISTA DE CLIENTES"
          documentDate={formatUtils.currentDate()}
          showCompanyInfo={false}
          theme={theme}
        />

        <View style={commonStyles.summarySection}>
          <View style={commonStyles.summaryRow}>
            <Text style={commonStyles.summaryLabel}>Total de Clientes:</Text>
            <Text style={commonStyles.summaryValue}>{clients.length}</Text>
          </View>
          {filters?.search && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Búsqueda:</Text>
              <Text style={commonStyles.summaryValue}>{filters.search}</Text>
            </View>
          )}
        </View>

        {clients.length > 0 ? (
          <>
            <Text style={commonStyles.sectionTitle}>DETALLE DE CLIENTES</Text>
            <View style={commonStyles.table}>
              <View style={commonStyles.tableHeader}>
                <Text style={styles.colName}>Nombre / Razón Social</Text>
                <Text style={styles.colRuc}>RUC</Text>
                <Text style={styles.colEmail}>Email</Text>
                <Text style={styles.colAddress}>Dirección</Text>
              </View>
              {clients.map((client, index) => (
                <View
                  key={`${client.ruc}-${index}`}
                  style={index % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
                >
                  <View style={styles.colName}>
                    <Text style={commonStyles.tableCell}>{client.name}</Text>
                    {client.contactPerson && (
                      <Text style={[commonStyles.tableCell, commonStyles.textSmall, commonStyles.textMuted]}>
                        Contacto: {client.contactPerson}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.colRuc}>{client.ruc}</Text>
                  <Text style={styles.colEmail}>{client.email}</Text>
                  <Text style={styles.colAddress}>{client.address}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={commonStyles.emptyState}>
            <Text>No hay clientes registrados para mostrar.</Text>
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

