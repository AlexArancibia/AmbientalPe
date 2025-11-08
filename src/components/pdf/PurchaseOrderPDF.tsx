import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './shared/PDFHeader';
import { PDFFooter } from './shared/PDFFooter';
import { PDFBankAccountsSection, type PdfBankAccount } from './shared/PDFBankAccountsSection';
import { createPdfTheme, formatUtils } from './shared/pdf-styles';
import type { BadgeStyle } from './shared/pdf-styles';

const layoutStyles = StyleSheet.create({
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
  tableColDescription: { width: '34%' },
  tableColName: { width: '22%' },
  tableColQuantity: { width: '12%', textAlign: 'center' },
  tableColPrice: { width: '10%', textAlign: 'right' },
  tableColTotal: { width: '10%', textAlign: 'right' },
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
  bankAccounts?: PdfBankAccount[];
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

interface PurchaseOrderPDFProps {
  purchaseOrder: {
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
      unitPrice: number;
    }>;
  };
  company?: CompanySummary;
}

export const PurchaseOrderPDF: React.FC<PurchaseOrderPDFProps> = ({ purchaseOrder, company }) => {
  const theme = createPdfTheme({
    primaryColor: company?.primaryColor,
    secondaryColor: company?.secondaryColor,
  });
  const commonStyles = theme.styles;

  const statusStyles: Record<string, { label: string; style: BadgeStyle }> = {
    pending: { label: 'PENDIENTE', style: commonStyles.badgePending as BadgeStyle },
    in_progress: { label: 'EN PROGRESO', style: commonStyles.badgeInProgress as BadgeStyle },
    completed: { label: 'COMPLETADA', style: commonStyles.badgeCompleted as BadgeStyle },
    cancelled: { label: 'CANCELADA', style: commonStyles.badgeCancelled as BadgeStyle },
    approved: { label: 'APROBADA', style: commonStyles.badgeApproved as BadgeStyle },
  };

  const statusKey = purchaseOrder.status.toLowerCase();
  const status =
    statusStyles[statusKey] ?? {
      label: purchaseOrder.status.toUpperCase(),
      style: commonStyles.badgeDraft as BadgeStyle,
    };

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <PDFHeader
          company={company}
          documentTitle="ORDEN DE COMPRA"
          documentNumber={purchaseOrder.number}
          documentDate={formatUtils.date(purchaseOrder.date)}
          theme={theme}
        />

        <View style={layoutStyles.badgeContainer}>
          <View style={[commonStyles.badge, status.style]}>
            <Text>{status.label}</Text>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>INFORMACIÓN DEL PROVEEDOR</Text>
          <View style={layoutStyles.infoGrid}>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Proveedor</Text>
              <Text style={commonStyles.value}>{purchaseOrder.client.name}</Text>
            </View>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>RUC</Text>
              <Text style={commonStyles.value}>{purchaseOrder.client.ruc}</Text>
            </View>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Email</Text>
              <Text style={commonStyles.value}>{purchaseOrder.client.email}</Text>
            </View>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Dirección</Text>
              <Text style={commonStyles.value}>{purchaseOrder.client.address}</Text>
            </View>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>DETALLES DE LA ORDEN</Text>
          <View style={layoutStyles.infoGrid}>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Fecha de Emisión</Text>
              <Text style={commonStyles.value}>{formatUtils.dateLong(purchaseOrder.date)}</Text>
            </View>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Gestor</Text>
              <Text style={commonStyles.value}>{purchaseOrder.gestor.name}</Text>
            </View>
            {purchaseOrder.attendantName && (
              <View style={layoutStyles.infoBox}>
                <Text style={commonStyles.label}>Encargado</Text>
                <Text style={commonStyles.value}>{purchaseOrder.attendantName}</Text>
              </View>
            )}
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Moneda</Text>
              <Text style={commonStyles.value}>{purchaseOrder.currency}</Text>
            </View>
            {purchaseOrder.paymentTerms && (
              <View style={layoutStyles.infoBox}>
                <Text style={commonStyles.label}>Términos de Pago</Text>
                <Text style={commonStyles.value}>{purchaseOrder.paymentTerms}</Text>
              </View>
            )}
          </View>
          {purchaseOrder.description && (
            <View style={{ marginTop: 6 }}>
              <Text style={commonStyles.label}>Descripción</Text>
              <Text style={commonStyles.value}>{purchaseOrder.description}</Text>
            </View>
          )}
        </View>

        <Text style={commonStyles.sectionTitle}>ITEMS DE COMPRA</Text>
        {purchaseOrder.items.length > 0 ? (
          <View style={commonStyles.table}>
            <View style={commonStyles.tableHeader}>
              <Text style={layoutStyles.tableColCode}>Código</Text>
              <Text style={layoutStyles.tableColDescription}>Descripción</Text>
              <Text style={layoutStyles.tableColName}>Nombre</Text>
              <Text style={layoutStyles.tableColQuantity}>Cantidad</Text>
              <Text style={layoutStyles.tableColPrice}>P. Unit.</Text>
              <Text style={layoutStyles.tableColTotal}>Total</Text>
            </View>
            {purchaseOrder.items.map((item, index) => {
              const total = item.quantity * item.unitPrice;
              return (
                <View
                  key={`${item.code}-${index}`}
                  style={index % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
                >
                  <Text style={layoutStyles.tableColCode}>{item.code}</Text>
                  <View style={layoutStyles.tableColDescription}>
                    <Text style={commonStyles.tableCell}>{item.description}</Text>
                  </View>
                  <Text style={layoutStyles.tableColName}>{item.name}</Text>
                  <Text style={layoutStyles.tableColQuantity}>{item.quantity}</Text>
                  <Text style={layoutStyles.tableColPrice}>
                    {formatUtils.currency(item.unitPrice, purchaseOrder.currency)}
                  </Text>
                  <Text style={layoutStyles.tableColTotal}>
                    {formatUtils.currency(total, purchaseOrder.currency)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={commonStyles.emptyState}>
            <Text>No hay items registrados.</Text>
          </View>
        )}

        <View style={commonStyles.totalsSection}>
          <View style={commonStyles.totalRow}>
            <Text style={commonStyles.totalLabel}>Subtotal</Text>
            <Text style={commonStyles.totalValue}>
              {formatUtils.currency(purchaseOrder.subtotal, purchaseOrder.currency)}
            </Text>
          </View>
          <View style={commonStyles.totalRow}>
            <Text style={commonStyles.totalLabel}>IGV (18%)</Text>
            <Text style={commonStyles.totalValue}>
              {formatUtils.currency(purchaseOrder.igv, purchaseOrder.currency)}
            </Text>
          </View>
          <View style={[commonStyles.totalRow, commonStyles.totalFinal]}>
            <Text style={commonStyles.totalFinalLabel}>TOTAL</Text>
            <Text style={commonStyles.totalFinalValue}>
              {formatUtils.currency(purchaseOrder.total, purchaseOrder.currency)}
            </Text>
          </View>
        </View>

        {purchaseOrder.comments && (
          <View style={commonStyles.notesSection}>
            <Text style={commonStyles.notesTitle}>COMENTARIOS</Text>
            <Text style={commonStyles.notesText}>{purchaseOrder.comments}</Text>
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

