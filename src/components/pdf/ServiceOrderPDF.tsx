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
  bankAccounts?: PdfBankAccount[];
  primaryColor?: string | null;
  secondaryColor?: string | null;
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

export const ServiceOrderPDF: React.FC<ServiceOrderPDFProps> = ({ serviceOrder, company }) => {
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
  };

  const statusKey = serviceOrder.status.toLowerCase();
  const status =
    statusStyles[statusKey] ?? {
      label: serviceOrder.status.toUpperCase(),
      style: commonStyles.badgeDraft as BadgeStyle,
    };

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <PDFHeader
          company={company}
          documentTitle="ORDEN DE SERVICIO"
          documentNumber={serviceOrder.number}
          documentDate={formatUtils.date(serviceOrder.date)}
          theme={theme}
        />

        <View style={layoutStyles.badgeContainer}>
          <View style={[commonStyles.badge, status.style]}>
            <Text>{status.label}</Text>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>INFORMACIÓN DEL CLIENTE</Text>
          <View style={layoutStyles.infoGrid}>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Cliente</Text>
              <Text style={commonStyles.value}>{serviceOrder.client.name}</Text>
            </View>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>RUC</Text>
              <Text style={commonStyles.value}>{serviceOrder.client.ruc}</Text>
            </View>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Email</Text>
              <Text style={commonStyles.value}>{serviceOrder.client.email}</Text>
            </View>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Dirección</Text>
              <Text style={commonStyles.value}>{serviceOrder.client.address}</Text>
            </View>
          </View>
        </View>

        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>DETALLES DE LA ORDEN</Text>
          <View style={layoutStyles.infoGrid}>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Fecha de Emisión</Text>
              <Text style={commonStyles.value}>{formatUtils.dateLong(serviceOrder.date)}</Text>
            </View>
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Gestor</Text>
              <Text style={commonStyles.value}>{serviceOrder.gestor.name}</Text>
            </View>
            {serviceOrder.attendantName && (
              <View style={layoutStyles.infoBox}>
                <Text style={commonStyles.label}>Encargado</Text>
                <Text style={commonStyles.value}>{serviceOrder.attendantName}</Text>
              </View>
            )}
            <View style={layoutStyles.infoBox}>
              <Text style={commonStyles.label}>Moneda</Text>
              <Text style={commonStyles.value}>{serviceOrder.currency}</Text>
            </View>
            {serviceOrder.paymentTerms && (
              <View style={layoutStyles.infoBox}>
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
              <Text style={layoutStyles.tableColCode}>Código</Text>
              <Text style={layoutStyles.tableColDescription}>Descripción</Text>
              <Text style={layoutStyles.tableColName}>Nombre</Text>
              <Text style={[layoutStyles.tableColQuantity, commonStyles.textCenter]}>Cant.</Text>
              <Text style={[layoutStyles.tableColDays, commonStyles.textCenter]}>Días</Text>
              <Text style={layoutStyles.tableColPrice}>P. Unit.</Text>
              <Text style={layoutStyles.tableColTotal}>Total</Text>
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
                  <Text style={layoutStyles.tableColCode}>{item.code}</Text>
                  <View style={layoutStyles.tableColDescription}>
                    <Text style={commonStyles.tableCell}>{item.description}</Text>
                  </View>
                  <Text style={layoutStyles.tableColName}>{item.name}</Text>
                  <Text style={[layoutStyles.tableColQuantity, commonStyles.textCenter]}>{item.quantity}</Text>
                  <Text style={[layoutStyles.tableColDays, commonStyles.textCenter]}>{days}</Text>
                  <Text style={layoutStyles.tableColPrice}>
                    {formatUtils.currency(item.unitPrice, serviceOrder.currency)}
                  </Text>
                  <Text style={layoutStyles.tableColTotal}>
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

