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
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 15,
    marginBottom: 10,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 5,
  },
  table: {
    width: '100%',
    marginTop: 8,
    marginBottom: 15,
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
    padding: 6,
    borderBottom: '1 solid #e2e8f0',
    fontSize: 8,
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: '#f8fafc',
    borderBottom: '1 solid #e2e8f0',
    fontSize: 8,
  },
  col1: {
    width: '15%',
  },
  col2: {
    width: '15%',
  },
  col3: {
    width: '30%',
  },
  col4: {
    width: '15%',
  },
  col5: {
    width: '15%',
  },
  col6: {
    width: '10%',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 7,
    fontWeight: 'bold',
  },
  badgePending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeInProgress: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  badgeCompleted: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  badgeCancelled: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  badgeApproved: {
    backgroundColor: '#e9d5ff',
    color: '#6b21a8',
  },
  emptyState: {
    padding: 20,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
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
    fontSize: 8,
    bottom: 15,
    right: 30,
    color: '#64748b',
  },
});

interface Order {
  number: string;
  date: string;
  client: { name: string };
  currency: string;
  total: number;
  status: string;
}

interface OrdersListPDFProps {
  serviceOrders: Order[];
  purchaseOrders: Order[];
  filters?: {
    search?: string;
  };
  summary?: {
    totalServiceOrders: number;
    totalPurchaseOrders: number;
    totalServiceAmount: number;
    totalPurchaseAmount: number;
  };
}

export const OrdersListPDF: React.FC<OrdersListPDFProps> = ({ 
  serviceOrders, 
  purchaseOrders, 
  filters, 
  summary 
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency || 'PEN',
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      APPROVED: 'Aprobada',
    };
    return labels[status] || status;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return styles.badgeCompleted;
      case 'IN_PROGRESS':
        return styles.badgeInProgress;
      case 'PENDING':
        return styles.badgePending;
      case 'CANCELLED':
        return styles.badgeCancelled;
      case 'APPROVED':
        return styles.badgeApproved;
      default:
        return styles.badgePending;
    }
  };

  const currentDate = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const renderOrderTable = (orders: Order[]) => {
    if (orders.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text>No hay órdenes registradas para mostrar.</Text>
        </View>
      );
    }

    return (
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Número</Text>
          <Text style={styles.col2}>Fecha</Text>
          <Text style={styles.col3}>Cliente/Proveedor</Text>
          <Text style={styles.col4}>Moneda</Text>
          <Text style={styles.col5}>Total</Text>
          <Text style={styles.col6}>Estado</Text>
        </View>
        {/* Rows */}
        {orders.map((order, index) => (
          <View
            key={index}
            style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
          >
            <Text style={styles.col1}>{order.number}</Text>
            <Text style={styles.col2}>{formatDate(order.date)}</Text>
            <Text style={styles.col3}>{order.client.name}</Text>
            <Text style={styles.col4}>{order.currency}</Text>
            <Text style={styles.col5}>{formatCurrency(order.total, order.currency)}</Text>
            <View style={[styles.col6, styles.badge, getStatusBadgeStyle(order.status)]}>
              <Text>{getStatusLabel(order.status)}</Text>
            </View>
          </View>
        ))}
      </View>
    );
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
            <Text style={styles.title}>REPORTE DE ÓRDENES</Text>
            <Text style={styles.subtitle}>Generado: {currentDate}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Órdenes de Servicio:</Text>
            <Text style={styles.summaryValue}>{summary?.totalServiceOrders || serviceOrders.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Órdenes de Compra:</Text>
            <Text style={styles.summaryValue}>{summary?.totalPurchaseOrders || purchaseOrders.length}</Text>
          </View>
          {summary?.totalServiceAmount && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monto Total (Servicio):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalServiceAmount, 'PEN')}</Text>
            </View>
          )}
          {summary?.totalPurchaseAmount && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monto Total (Compra):</Text>
              <Text style={styles.summaryValue}>{formatCurrency(summary.totalPurchaseAmount, 'PEN')}</Text>
            </View>
          )}
          {filters?.search && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Búsqueda:</Text>
              <Text style={styles.summaryValue}>{filters.search}</Text>
            </View>
          )}
        </View>

        {/* Service Orders Section */}
        {serviceOrders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Órdenes de Servicio</Text>
            {renderOrderTable(serviceOrders)}
          </>
        )}

        {/* Purchase Orders Section */}
        {purchaseOrders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Órdenes de Compra</Text>
            {renderOrderTable(purchaseOrders)}
          </>
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

