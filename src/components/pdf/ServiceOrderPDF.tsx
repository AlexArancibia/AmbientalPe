import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './shared/PDFHeader';
import { PDFFooter } from './shared/PDFFooter';
import { commonStyles, formatUtils } from './shared/pdf-styles';

const styles = StyleSheet.create({
  infoGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoBox: {
    width: '48%',
    marginBottom: 6,
  },
  tableColCode: { width: '12%' },
  tableColDescription: { width: '30%' },
  tableColName: { width: '20%' },
  tableColQuantity: { width: '10%' },
  tableColDays: { width: '10%' },
  tableColPrice: { width: '9%', textAlign: 'right' },
  tableColTotal: { width: '9%', textAlign: 'right' },
  badgeContainer: {
    alignSelf: 'flex-start',
    marginTop: -10,
    marginBottom: 10,
  },
});

interface CompanySummary {
  name: string;
  ruc: string;
  address: string;
  email: string;
  phone: string;
  logo?: string | null;
}

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
  company?: CompanySummary;
}

const statusStyles: Record<
  string,
  { label: string; style: object }
> = {
  pending: { label: 'PENDIENTE', style: commonStyles.badgePending },
  in_progress: { label: 'EN PROGRESO', style: commonStyles.badgeInProgress },
  completed: { label: 'COMPLETADA', style: commonStyles.badgeCompleted },
  cancelled: { label: 'CANCELADA', style: commonStyles.badgeCancelled },
};

export const ServiceOrderPDF: React.FC<ServiceOrderPDFProps> = ({ serviceOrder, company }) => {
  const statusKey = serviceOrder.status.toLowerCase();
  const status = statusStyles[statusKey] ?? {
    label: serviceOrder.status.toUpperCase(),
    style: commonStyles.badgeDraft,
  };

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <PDFHeader
          company={company}
          documentTitle="ORDEN DE SERVICIO"
          documentNumber={serviceOrder.number}
          documentDate={formatUtils.date(serviceOrder.date)}
        />

        <View style={styles.badgeContainer}>
          <View style={[commonStyles.badge, status.style]}>
            <Text>{status.label}</Text>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={commonStyles.label}>Cliente</Text>
              <Text style={commonStyles.value}>{serviceOrder.client.name}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={commonStyles.label}>RUC</Text>
              <Text style={commonStyles.value}>{serviceOrder.client.ruc}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={commonStyles.label}>Email</Text>
              <Text style={commonStyles.value}>{serviceOrder.client.email}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={commonStyles.label}>Dirección</Text>
              <Text style={commonStyles.value}>{serviceOrder.client.address}</Text>
            </View>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>DETALLES DE LA ORDEN</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={commonStyles.label}>Fecha de Emisión</Text>
              <Text style={commonStyles.value}>{formatUtils.dateLong(serviceOrder.date)}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={commonStyles.label}>Gestor</Text>
              <Text style={commonStyles.value}>{serviceOrder.gestor.name}</Text>
            </View>
            {serviceOrder.attendantName && (
              <View style={styles.infoBox}>
                <Text style={commonStyles.label}>Encargado</Text>
                <Text style={commonStyles.value}>{serviceOrder.attendantName}</Text>
              </View>
            )}
            <View style={styles.infoBox}>
              <Text style={commonStyles.label}>Moneda</Text>
              <Text style={commonStyles.value}>{serviceOrder.currency}</Text>
            </View>
            {serviceOrder.paymentTerms && (
              <View style={styles.infoBox}>
                <Text style={commonStyles.label}>Términos de Pago</Text>
                <Text style={commonStyles.value}>{serviceOrder.paymentTerms}</Text>
              </View>
            )}
          </View>
          {serviceOrder.description && (
            <View style={{ marginTop: 6 }}>
              <Text style={commonStyles.label}>Descripción</Text>
              <Text style={commonStyles.value}>{serviceOrder.description}</Text>
            </View>
          )}
        </View>

        <Text style={commonStyles.sectionTitle}>SERVICIOS</Text>
        {serviceOrder.items.length > 0 ? (
          <View style={commonStyles.table}>
            <View style={commonStyles.tableHeader}>
              <Text style={styles.tableColCode}>Código</Text>
              <Text style={styles.tableColDescription}>Descripción</Text>
              <Text style={styles.tableColName}>Nombre</Text>
              <Text style={[styles.tableColQuantity, commonStyles.textCenter]}>Cant.</Text>
              <Text style={[styles.tableColDays, commonStyles.textCenter]}>Días</Text>
              <Text style={styles.tableColPrice}>P. Unit.</Text>
              <Text style={styles.tableColTotal}>Total</Text>
            </View>
            {serviceOrder.items.map((item, index) => {
              const days = item.days ?? 1;
              const subtotal = item.quantity * item.unitPrice;
              const total = subtotal * days;

              return (
                <View
                  key={`${item.code}-${index}`}
                  style={index % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
                >
                  <Text style={styles.tableColCode}>{item.code}</Text>
                  <View style={styles.tableColDescription}>
                    <Text style={commonStyles.tableCell}>{item.description}</Text>
                  </View>
                  <Text style={styles.tableColName}>{item.name}</Text>
                  <Text style={[styles.tableColQuantity, commonStyles.textCenter]}>{item.quantity}</Text>
                  <Text style={[styles.tableColDays, commonStyles.textCenter]}>{days}</Text>
                  <Text style={styles.tableColPrice}>
                    {formatUtils.currency(item.unitPrice, serviceOrder.currency)}
                  </Text>
                  <Text style={styles.tableColTotal}>
                    {formatUtils.currency(total, serviceOrder.currency)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={commonStyles.emptyState}>
            <Text>No hay servicios registrados.</Text>
          </View>
        )}

        <View style={commonStyles.totalsSection}>
          <View style={commonStyles.totalRow}>
            <Text style={commonStyles.totalLabel}>Subtotal</Text>
            <Text style={commonStyles.totalValue}>
              {formatUtils.currency(serviceOrder.subtotal, serviceOrder.currency)}
            </Text>
          </View>
          <View style={commonStyles.totalRow}>
            <Text style={commonStyles.totalLabel}>IGV (18%)</Text>
            <Text style={commonStyles.totalValue}>
              {formatUtils.currency(serviceOrder.igv, serviceOrder.currency)}
            </Text>
          </View>
          <View style={[commonStyles.totalRow, commonStyles.totalFinal]}>
            <Text style={commonStyles.totalFinalLabel}>TOTAL</Text>
            <Text style={commonStyles.totalFinalValue}>
              {formatUtils.currency(serviceOrder.total, serviceOrder.currency)}
            </Text>
          </View>
        </View>

        {serviceOrder.comments && (
          <View style={commonStyles.notesSection}>
            <Text style={commonStyles.notesTitle}>COMENTARIOS</Text>
            <Text style={commonStyles.notesText}>{serviceOrder.comments}</Text>
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
          customText={`Orden de servicio generada el ${formatUtils.currentDate()}`}
        />
      </Page>
    </Document>
  );
};

