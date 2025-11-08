import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './shared/PDFHeader';
import { PDFFooter } from './shared/PDFFooter';
import { commonStyles, formatUtils } from './shared/pdf-styles';

const styles = StyleSheet.create({
  colNumber: { width: '15%' },
  colDate: { width: '15%' },
  colClient: { width: '30%' },
  colCurrency: { width: '10%', textAlign: 'center' },
  colTotal: { width: '15%', textAlign: 'right' },
  colStatus: { width: '15%' },
  sectionSpacing: { marginTop: 12 },
});

interface CompanySummary {
  name: string;
  ruc: string;
  address: string;
  email: string;
  phone: string;
  logo?: string | null;
}

interface OrderSummary {
  number: string;
  date: string;
  client: { name: string };
  currency: string;
  total: number;
  status: string;
}

interface OrdersListPDFProps {
  serviceOrders: OrderSummary[];
  purchaseOrders: OrderSummary[];
  filters?: {
    search?: string;
  };
  summary?: {
    totalServiceOrders: number;
    totalPurchaseOrders: number;
    totalServiceAmount: number;
    totalPurchaseAmount: number;
  };
  company?: CompanySummary;
}

const statusStyles: Record<
  string,
  { label: string; style: object }
> = {
  pending: { label: 'Pendiente', style: commonStyles.badgePending },
  in_progress: { label: 'En Progreso', style: commonStyles.badgeInProgress },
  completed: { label: 'Completada', style: commonStyles.badgeCompleted },
  cancelled: { label: 'Cancelada', style: commonStyles.badgeCancelled },
  approved: { label: 'Aprobada', style: commonStyles.badgeApproved },
};

const renderOrderTable = (orders: OrderSummary[]) => {
  if (orders.length === 0) {
    return (
      <View style={commonStyles.emptyState}>
        <Text>No hay órdenes registradas para mostrar.</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.table}>
      <View style={commonStyles.tableHeader}>
        <Text style={styles.colNumber}>Número</Text>
        <Text style={styles.colDate}>Fecha</Text>
        <Text style={styles.colClient}>Cliente / Proveedor</Text>
        <Text style={styles.colCurrency}>Moneda</Text>
        <Text style={styles.colTotal}>Total</Text>
        <Text style={styles.colStatus}>Estado</Text>
      </View>
      {orders.map((order, index) => {
        const statusKey = order.status.toLowerCase();
        const status = statusStyles[statusKey] ?? {
          label: order.status,
          style: commonStyles.badgeDraft,
        };

        return (
          <View
            key={`${order.number}-${index}`}
            style={index % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
          >
            <Text style={styles.colNumber}>{order.number}</Text>
            <Text style={styles.colDate}>{formatUtils.date(order.date)}</Text>
            <Text style={styles.colClient}>{order.client.name}</Text>
            <Text style={styles.colCurrency}>{order.currency}</Text>
            <Text style={styles.colTotal}>
              {formatUtils.currency(order.total, order.currency)}
            </Text>
            <View style={styles.colStatus}>
              <View style={[commonStyles.badge, status.style]}>
                <Text>{status.label}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export const OrdersListPDF: React.FC<OrdersListPDFProps> = ({
  serviceOrders,
  purchaseOrders,
  filters,
  summary,
  company,
}) => {
  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <PDFHeader
          company={company}
          documentTitle="REPORTE DE ÓRDENES"
          documentDate={formatUtils.currentDate()}
          showCompanyInfo={false}
        />

        <View style={commonStyles.summarySection}>
          <View style={commonStyles.summaryRow}>
            <Text style={commonStyles.summaryLabel}>Órdenes de Servicio:</Text>
            <Text style={commonStyles.summaryValue}>
              {summary?.totalServiceOrders ?? serviceOrders.length}
            </Text>
          </View>
          <View style={commonStyles.summaryRow}>
            <Text style={commonStyles.summaryLabel}>Órdenes de Compra:</Text>
            <Text style={commonStyles.summaryValue}>
              {summary?.totalPurchaseOrders ?? purchaseOrders.length}
            </Text>
          </View>
          {summary?.totalServiceAmount !== undefined && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Monto Total (Servicio):</Text>
              <Text style={commonStyles.summaryValue}>
                {formatUtils.currency(summary.totalServiceAmount, 'PEN')}
              </Text>
            </View>
          )}
          {summary?.totalPurchaseAmount !== undefined && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Monto Total (Compra):</Text>
              <Text style={commonStyles.summaryValue}>
                {formatUtils.currency(summary.totalPurchaseAmount, 'PEN')}
              </Text>
            </View>
          )}
          {filters?.search && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Búsqueda:</Text>
              <Text style={commonStyles.summaryValue}>{filters.search}</Text>
            </View>
          )}
        </View>

        {serviceOrders.length > 0 && (
          <View style={styles.sectionSpacing}>
            <Text style={commonStyles.sectionTitle}>ÓRDENES DE SERVICIO</Text>
            {renderOrderTable(serviceOrders)}
          </View>
        )}

        {purchaseOrders.length > 0 && (
          <View style={styles.sectionSpacing}>
            <Text style={commonStyles.sectionTitle}>ÓRDENES DE COMPRA</Text>
            {renderOrderTable(purchaseOrders)}
          </View>
        )}

        {serviceOrders.length === 0 && purchaseOrders.length === 0 && (
          <View style={commonStyles.emptyState}>
            <Text>No hay órdenes registradas para mostrar.</Text>
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

