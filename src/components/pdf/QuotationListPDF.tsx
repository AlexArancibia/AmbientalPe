import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './shared/PDFHeader';
import { PDFFooter } from './shared/PDFFooter';
import { commonStyles, colors, formatUtils } from './shared/pdf-styles';

// Estilos específicos para el reporte
const reportStyles = StyleSheet.create({
  col1: { width: '15%' }, // Número
  col2: { width: '15%' }, // Fecha
  col3: { width: '30%' }, // Cliente
  col4: { width: '12%' }, // Moneda
  col5: { width: '15%' }, // Total
  col6: { width: '13%' }, // Estado
});

interface QuotationListPDFProps {
  quotations: Array<{
    number: string;
    date: string;
    client: { name: string };
    currency: string;
    total: number;
    status: string;
  }>;
  filters?: {
    search?: string;
    status?: string;
  };
  summary?: {
    totalQuotations: number;
    totalAmount: number;
    byStatus: Record<string, number>;
  };
  company?: {
    name: string;
    ruc: string;
    address: string;
    email: string;
    phone: string;
    logo?: string | null;
  };
}

export const QuotationListPDF: React.FC<QuotationListPDFProps> = ({ 
  quotations, 
  filters, 
  summary,
  company 
}) => {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobada',
      REJECTED: 'Rechazada',
      DRAFT: 'Borrador',
    };
    return labels[status] || status;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return commonStyles.badgeApproved;
      case 'PENDING':
        return commonStyles.badgePending;
      case 'REJECTED':
        return commonStyles.badgeCancelled;
      case 'DRAFT':
        return commonStyles.badgeDraft;
      default:
        return commonStyles.badgeDraft;
    }
  };

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        {/* Header */}
        <PDFHeader
          company={company}
          documentTitle="REPORTE DE COTIZACIONES"
          documentDate={formatUtils.currentDate()}
          showCompanyInfo={false}
        />

        {/* Summary Section */}
        <View style={commonStyles.summarySection}>
          <View style={commonStyles.summaryRow}>
            <Text style={commonStyles.summaryLabel}>Total de Cotizaciones:</Text>
            <Text style={commonStyles.summaryValue}>
              {summary?.totalQuotations || quotations.length}
            </Text>
          </View>
          {summary?.totalAmount && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Monto Total:</Text>
              <Text style={commonStyles.summaryValue}>
                {formatUtils.currency(summary.totalAmount, 'PEN')}
              </Text>
            </View>
          )}
          {filters?.search && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Búsqueda:</Text>
              <Text style={commonStyles.summaryValue}>{filters.search}</Text>
            </View>
          )}
          {filters?.status && (
            <View style={commonStyles.summaryRow}>
              <Text style={commonStyles.summaryLabel}>Estado Filtrado:</Text>
              <Text style={commonStyles.summaryValue}>{getStatusLabel(filters.status)}</Text>
            </View>
          )}
        </View>

        {/* Table */}
        <Text style={commonStyles.sectionTitle}>DETALLE DE COTIZACIONES</Text>
        {quotations.length > 0 ? (
          <View style={commonStyles.table}>
            {/* Header */}
            <View style={commonStyles.tableHeader}>
              <Text style={reportStyles.col1}>Número</Text>
              <Text style={reportStyles.col2}>Fecha</Text>
              <Text style={reportStyles.col3}>Cliente</Text>
              <Text style={[reportStyles.col4, commonStyles.textCenter]}>Moneda</Text>
              <Text style={[reportStyles.col5, commonStyles.textRight]}>Total</Text>
              <Text style={[reportStyles.col6, commonStyles.textCenter]}>Estado</Text>
            </View>
            
            {/* Rows */}
            {quotations.map((quotation, index) => (
              <View
                key={index}
                style={index % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
              >
                <Text style={reportStyles.col1}>{quotation.number}</Text>
                <Text style={reportStyles.col2}>{formatUtils.date(quotation.date)}</Text>
                <Text style={reportStyles.col3}>{quotation.client.name}</Text>
                <Text style={[reportStyles.col4, commonStyles.textCenter]}>
                  {quotation.currency}
                </Text>
                <Text style={[reportStyles.col5, commonStyles.textRight]}>
                  {formatUtils.currency(quotation.total, quotation.currency)}
                </Text>
                <View style={[reportStyles.col6, commonStyles.badge, getStatusBadgeStyle(quotation.status)]}>
                  <Text>{getStatusLabel(quotation.status)}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={commonStyles.emptyState}>
            <Text>No hay cotizaciones registradas para mostrar.</Text>
          </View>
        )}

        {/* Footer */}
        <PDFFooter
          company={company ? {
            name: company.name,
            email: company.email,
            phone: company.phone,
          } : undefined}
        />
      </Page>
    </Document>
  );
};
