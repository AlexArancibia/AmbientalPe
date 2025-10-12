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
  col1: { width: '12%' },
  col2: { width: '22%' },
  col3: { width: '18%' },
  col4: { width: '13%' },
  col5: { width: '15%' },
  col6: { width: '20%' },
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
  statusBadge: {
    padding: 2,
    borderRadius: 2,
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusAvailable: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusInUse: {
    backgroundColor: '#dbeafe',
    color: '#1e3a8a',
  },
  statusMaintenance: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusInactive: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
});

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
}

export const EquipmentListPDF: React.FC<EquipmentListPDFProps> = ({ equipment, filters }) => {
  const formatDate = () => {
    return new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
      case 'disponible':
        return styles.statusAvailable;
      case 'in_use':
      case 'en_uso':
        return styles.statusInUse;
      case 'maintenance':
      case 'mantenimiento':
        return styles.statusMaintenance;
      default:
        return styles.statusInactive;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      available: 'DISPONIBLE',
      in_use: 'EN USO',
      maintenance: 'MANTENIMIENTO',
      inactive: 'INACTIVO',
    };
    return statusMap[status.toLowerCase()] || status.toUpperCase();
  };

  const statusCounts = equipment.reduce((acc, eq) => {
    const status = eq.status.toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
            <Text style={styles.title}>INVENTARIO DE EQUIPOS</Text>
            <Text style={styles.subtitle}>Generado: {formatDate()}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Equipos:</Text>
            <Text style={styles.summaryValue}>{equipment.length}</Text>
          </View>
          {Object.entries(statusCounts).map(([status, count]) => (
            <View key={status} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{getStatusText(status)}:</Text>
              <Text style={styles.summaryValue}>{count}</Text>
            </View>
          ))}
          {filters?.type && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Filtro Tipo:</Text>
              <Text style={styles.summaryValue}>{filters.type}</Text>
            </View>
          )}
          {filters?.search && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Búsqueda:</Text>
              <Text style={styles.summaryValue}>{filters.search}</Text>
            </View>
          )}
        </View>

        {/* Table */}
        {equipment.length > 0 ? (
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Código</Text>
              <Text style={styles.col2}>Nombre</Text>
              <Text style={styles.col3}>Tipo</Text>
              <Text style={styles.col4}>Estado</Text>
              <Text style={styles.col5}>N° Serie</Text>
              <Text style={styles.col6}>Descripción</Text>
            </View>
            {/* Rows */}
            {equipment.map((item, index) => (
              <View
                key={index}
                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={styles.col1}>{item.code}</Text>
                <Text style={styles.col2}>{item.name}</Text>
                <Text style={styles.col3}>{item.type}</Text>
                <View style={[styles.col4, { flexDirection: 'row' }]}>
                  <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text>{getStatusText(item.status)}</Text>
                  </View>
                </View>
                <Text style={styles.col5}>{item.serialNumber || 'N/A'}</Text>
                <Text style={styles.col6}>{item.description}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text>No hay equipos registrados para mostrar.</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Inventario generado automáticamente - AmbientalPE</Text>
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

