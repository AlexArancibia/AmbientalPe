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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
    color: '#475569',
  },
  value: {
    width: '60%',
    color: '#1e293b',
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
    fontSize: 8,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottom: '1 solid #e2e8f0',
    padding: 6,
    fontSize: 8,
  },
  col1: { width: '10%' },
  col2: { width: '30%' },
  col3: { width: '20%' },
  col4: { width: '12%' },
  col5: { width: '12%' },
  col6: { width: '16%', textAlign: 'right' },
  totalsSection: {
    marginTop: 15,
    alignItems: 'flex-end',
  },
  totalsBox: {
    width: '40%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
    border: '1 solid #e2e8f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 9,
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#475569',
  },
  totalValue: {
    color: '#1e293b',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTop: '2 solid #1e3a8a',
    fontSize: 11,
  },
  grandTotalLabel: {
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  grandTotalValue: {
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
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
  notesSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    border: '1 solid #fbbf24',
  },
  notesTitle: {
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  notesText: {
    color: '#78350f',
    fontSize: 8,
    lineHeight: 1.4,
  },
  statusBadge: {
    padding: 4,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusInProgress: {
    backgroundColor: '#dbeafe',
    color: '#1e3a8a',
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
});

interface ServiceOrderPDFProps {
  serviceOrder: {
    number: string;
    date: string;
    currency: string;
    subtotal: number;
    igv: number;
    total: number;
    description?: string | null;
    paymentTerms?: string | null;
    comments?: string | null;
    attendantName?: string | null;
    status: string;
    client: {
      name: string;
      ruc: string;
      email: string;
      address: string;
    };
    gestor: {
      name: string;
      email: string;
    };
    items: Array<{
      code: string;
      name: string;
      description: string;
      quantity: number;
      days?: number | null;
      unitPrice: number;
    }>;
  };
}

export const ServiceOrderPDF: React.FC<ServiceOrderPDFProps> = ({ serviceOrder }) => {
  const currencySymbol = serviceOrder.currency === 'PEN' ? 'S/' : '$';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'completado':
        return styles.statusCompleted;
      case 'in_progress':
      case 'en_progreso':
        return styles.statusInProgress;
      default:
        return styles.statusPending;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'PENDIENTE',
      in_progress: 'EN PROGRESO',
      completed: 'COMPLETADO',
      cancelled: 'CANCELADO',
    };
    return statusMap[status.toLowerCase()] || status.toUpperCase();
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
            <Text style={styles.title}>ORDEN DE SERVICIO</Text>
            <Text style={styles.subtitle}>Nº {serviceOrder.number}</Text>
            <View style={[styles.statusBadge, getStatusStyle(serviceOrder.status)]}>
              <Text>{getStatusText(serviceOrder.status)}</Text>
            </View>
          </View>
        </View>

        {/* Información del Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{serviceOrder.client.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>RUC:</Text>
            <Text style={styles.value}>{serviceOrder.client.ruc}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{serviceOrder.client.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.value}>{serviceOrder.client.address}</Text>
          </View>
        </View>

        {/* Detalles de la Orden */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETALLES DE LA ORDEN</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha de Emisión:</Text>
            <Text style={styles.value}>{formatDate(serviceOrder.date)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Gestor:</Text>
            <Text style={styles.value}>{serviceOrder.gestor.name}</Text>
          </View>
          {serviceOrder.attendantName && (
            <View style={styles.row}>
              <Text style={styles.label}>Encargado:</Text>
              <Text style={styles.value}>{serviceOrder.attendantName}</Text>
            </View>
          )}
          {serviceOrder.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Descripción:</Text>
              <Text style={styles.value}>{serviceOrder.description}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Moneda:</Text>
            <Text style={styles.value}>{serviceOrder.currency}</Text>
          </View>
          {serviceOrder.paymentTerms && (
            <View style={styles.row}>
              <Text style={styles.label}>Términos de Pago:</Text>
              <Text style={styles.value}>{serviceOrder.paymentTerms}</Text>
            </View>
          )}
        </View>

        {/* Tabla de Servicios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SERVICIOS</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Código</Text>
              <Text style={styles.col2}>Descripción</Text>
              <Text style={styles.col3}>Nombre</Text>
              <Text style={styles.col4}>Cant.</Text>
              <Text style={styles.col5}>Días</Text>
              <Text style={styles.col6}>Precio Unit.</Text>
              <Text style={styles.col6}>Total</Text>
            </View>
            {/* Rows */}
            {serviceOrder.items.map((item, index) => {
              const days = item.days || 1;
              const total = item.quantity * days * item.unitPrice;
              return (
                <View
                  key={index}
                  style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={styles.col1}>{item.code}</Text>
                  <Text style={styles.col2}>{item.description}</Text>
                  <Text style={styles.col3}>{item.name}</Text>
                  <Text style={styles.col4}>{item.quantity}</Text>
                  <Text style={styles.col5}>{days}</Text>
                  <Text style={styles.col6}>
                    {currencySymbol} {formatCurrency(item.unitPrice)}
                  </Text>
                  <Text style={styles.col6}>
                    {currencySymbol} {formatCurrency(total)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>
                {currencySymbol} {formatCurrency(serviceOrder.subtotal)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IGV (18%):</Text>
              <Text style={styles.totalValue}>
                {currencySymbol} {formatCurrency(serviceOrder.igv)}
              </Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL:</Text>
              <Text style={styles.grandTotalValue}>
                {currencySymbol} {formatCurrency(serviceOrder.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Comentarios */}
        {serviceOrder.comments && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>COMENTARIOS:</Text>
            <Text style={styles.notesText}>{serviceOrder.comments}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Orden de servicio generada el {formatDate(new Date().toISOString())}
          </Text>
          <Text style={{ marginTop: 3 }}>
            Para consultas, contáctenos a través de nuestros canales oficiales.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

