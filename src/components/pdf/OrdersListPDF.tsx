import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './shared/PDFHeader';
import { PDFFooter } from './shared/PDFFooter';
import { PDFBankAccountsSection, type PdfBankAccount } from './shared/PDFBankAccountsSection';
import { createPdfTheme, formatUtils } from './shared/pdf-styles';
import type { BadgeStyle } from './shared/pdf-styles';

const tableStyles = StyleSheet.create({
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
  bankAccounts?: PdfBankAccount[];
  primaryColor?: string | null;
  secondaryColor?: string | null;
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

export const OrdersListPDF: React.FC<OrdersListPDFProps> = ({
  serviceOrders,
  purchaseOrders,
  filters,
  summary,
  company,
}) => {
  const theme = createPdfTheme({
    primaryColor: company?.primaryColor,
    secondaryColor: company?.secondaryColor,
  });
  const styles = theme.styles;

  const statusStyles: Record<string, { label: string; style: BadgeStyle }> = {
    pending: { label: 'Pendiente', style: styles.badgePending as BadgeStyle },
    in_progress: { label: 'En Progreso', style: styles.badgeInProgress as BadgeStyle },
    completed: { label: 'Completada', style: styles.badgeCompleted as BadgeStyle },
    cancelled: { label: 'Cancelada', style: styles.badgeCancelled as BadgeStyle },
    approved: { label: 'Aprobada', style: styles.badgeApproved as BadgeStyle },
  };

  const renderOrderTable = (orders: OrderSummary[]) => {
    if (orders.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text>No hay órdenes registradas para mostrar.</Text>
        </View>
      );
    }

    return (
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={tableStyles.colNumber}>Número</Text>
          <Text style={tableStyles.colDate}>Fecha</Text>
          <Text style={tableStyles.colClient}>Cliente / Proveedor</Text>
          <Text style={tableStyles.colCurrency}>Moneda</Text>
          <Text style={tableStyles.colTotal}>Total</Text>
          <Text style={tableStyles.colStatus}>Estado</Text>
        </View>
        {orders.map((order, index) => {
          const statusKey = order.status.toLowerCase();
          const status =
            statusStyles[statusKey] ?? {
              label: order.status,
              style: styles.badgeDraft as BadgeStyle,
            };

          return (
            <View
              key={`${order.number}-${index}`}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={tableStyles.colNumber}>{order.number}</Text>
              <Text style={tableStyles.colDate}>{formatUtils.date(order.date)}</Text>
              <Text style={tableStyles.colClient}>{order.client.name}</Text>
              <Text style={tableStyles.colCurrency}>{order.currency}</Text>
              <Text style={tableStyles.colTotal}>
                {formatUtils.currency(order.total, order.currency)}
              </Text>
              <View style={tableStyles.colStatus}>
                <View style={[styles.badge, status.style]}>
                  <Text>{status.label}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          company={company}
          documentTitle="REPORTE DE ÓRDENES"
          documentDate={formatUtils.currentDate()}
          showCompanyInfo={false}
          theme={theme}
        />

        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Órdenes de Servicio:</Text>
            <Text style={styles.summaryValue}>
              {summary?.totalServiceOrders ?? serviceOrders.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Órdenes de Compra:</Text>
            <Text style={styles.summaryValue}>
              {summary?.totalPurchaseOrders ?? purchaseOrders.length}
            </Text>
          </View>
          {summary?.totalServiceAmount !== undefined && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monto Total (Servicio):</Text>
              <Text style={styles.summaryValue}>
                {formatUtils.currency(summary.totalServiceAmount, 'PEN')}
              </Text>
            </View>
          )}
          {summary?.totalPurchaseAmount !== undefined && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monto Total (Compra):</Text>
              <Text style={styles.summaryValue}>
                {formatUtils.currency(summary.totalPurchaseAmount, 'PEN')}
              </Text>
            </View>
          )}
          {filters?.search && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Búsqueda:</Text>
              <Text style={styles.summaryValue}>{filters.search}</Text>
            </View>
          )}
        </View>

        {serviceOrders.length > 0 && (
          <View style={tableStyles.sectionSpacing}>
            <Text style={styles.sectionTitle}>ÓRDENES DE SERVICIO</Text>
            {renderOrderTable(serviceOrders)}
          </View>
        )}

        {purchaseOrders.length > 0 && (
          <View style={tableStyles.sectionSpacing}>
            <Text style={styles.sectionTitle}>ÓRDENES DE COMPRA</Text>
            {renderOrderTable(purchaseOrders)}
          </View>
        )}

        {serviceOrders.length === 0 && purchaseOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Text>No hay órdenes registradas para mostrar.</Text>
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

