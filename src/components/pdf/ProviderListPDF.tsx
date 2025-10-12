import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: '2 solid #1e3a8a',
    paddingBottom: 12,
  },
  logoContainer: {
    width: 100,
    height: 40,
    backgroundColor: '#1e3a8a',
    padding: 6,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  summarySection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    border: '1 solid #e2e8f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontWeight: 'bold',
    color: '#475569',
    fontSize: 9,
  },
  summaryValue: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 9,
  },
  table: {
    width: '100%',
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    padding: 6,
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
    padding: 6,
    fontSize: 7,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottom: '1 solid #e2e8f0',
    padding: 6,
    fontSize: 7,
  },
  col1: { width: '25%' },
  col2: { width: '15%' },
  col3: { width: '20%' },
  col4: { width: '40%' },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 7,
    borderTop: '1 solid #e2e8f0',
    paddingTop: 8,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 10,
    right: 30,
    fontSize: 7,
    color: '#94a3b8',
  },
  emptyState: {
    textAlign: 'center',
    padding: 30,
    color: '#94a3b8',
    fontSize: 10,
  },
});

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
}

export const ProviderListPDF: React.FC<ProviderListPDFProps> = ({ providers, filters }) => {
  const formatDate = () => {
    return new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              src={`${process.cwd()}/public/logo.png`}
              style={styles.logo}
            />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>LISTA DE PROVEEDORES</Text>
            <Text style={styles.subtitle}>Generado: {formatDate()}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Proveedores:</Text>
            <Text style={styles.summaryValue}>{providers.length}</Text>
          </View>
          {filters?.search && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Búsqueda:</Text>
              <Text style={styles.summaryValue}>{filters.search}</Text>
            </View>
          )}
        </View>

        {/* Table */}
        {providers.length > 0 ? (
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Nombre / Razón Social</Text>
              <Text style={styles.col2}>RUC</Text>
              <Text style={styles.col3}>Email</Text>
              <Text style={styles.col4}>Dirección</Text>
            </View>
            {/* Rows */}
            {providers.map((provider, index) => (
              <View
                key={index}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={styles.col1}>{provider.name}</Text>
                <Text style={styles.col2}>{provider.ruc}</Text>
                <Text style={styles.col3}>{provider.email}</Text>
                <Text style={styles.col4}>{provider.address}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text>No hay proveedores registrados para mostrar.</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Reporte generado automáticamente - AmbientalPE</Text>
          <Text style={{ marginTop: 3 }}>
            Para más información, contáctenos a través de nuestros canales oficiales.
          </Text>
        </View>

        {/* Page Number */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Página ${pageNumber} de ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

