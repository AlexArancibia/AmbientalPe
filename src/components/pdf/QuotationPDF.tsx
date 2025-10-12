import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFHeader } from './shared/PDFHeader';
import { PDFFooter } from './shared/PDFFooter';
import { commonStyles, colors, formatUtils } from './shared/pdf-styles';

// Estilos específicos para cotizaciones
const quotationStyles = StyleSheet.create({
  // Columnas de tabla específicas
  col1: { width: '12%' }, // Código
  col2: { width: '28%' }, // Descripción
  col3: { width: '10%' }, // Cant
  col4: { width: '10%' }, // Días
  col5: { width: '15%' }, // P.Unit
  col6: { width: '15%' }, // Subtotal
  col7: { width: '10%' }, // Total
  
  // Información del cliente
  clientBox: {
    padding: 10,
    backgroundColor: colors.gray,
    borderRadius: 4,
    border: `1 solid ${colors.border}`,
    marginBottom: 15,
  },
  clientTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 6,
  },
  clientInfo: {
    fontSize: 8,
    marginBottom: 2,
    color: colors.text,
  },
  
  // Notas bancarias
  bankSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: colors.infoBg,
    borderLeft: `3 solid ${colors.info}`,
  },
  bankTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.info,
    marginBottom: 4,
  },
  bankInfo: {
    fontSize: 7,
    color: colors.grayDark,
    marginBottom: 1,
  },
});

interface QuotationPDFProps {
  quotation: {
    number: string;
    date: string;
    validityDays: number;
    currency: string;
    subtotal: number;
    igv: number;
    total: number;
    notes: string | null;
    equipmentReleaseDate?: string;
    returnDate?: string | null;
    monitoringLocation?: string;
    client: {
      name: string;
      ruc: string;
      email: string;
      address: string;
    };
    items: Array<{
      code: string;
      name: string;
      description: string;
      quantity: number;
      days: number;
      unitPrice: number;
    }>;
    company?: {
      name: string;
      ruc: string;
      address: string;
      email: string;
      phone: string;
      logo?: string | null;
      bankAccount?: {
        bankName: string;
        accountNumber: string;
        accountType: string;
        currency: string;
      } | null;
    };
  };
}

export const QuotationPDF: React.FC<QuotationPDFProps> = ({ quotation }) => {
  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        {/* Header */}
        <PDFHeader
          company={quotation.company}
          documentTitle="COTIZACIÓN"
          documentNumber={quotation.number}
          documentDate={formatUtils.date(quotation.date)}
        />

        {/* Document Information */}
        <View style={commonStyles.section}>
          <View style={commonStyles.row}>
            <View style={commonStyles.col2}>
              <Text style={commonStyles.documentInfo}>
                <Text style={commonStyles.documentInfoLabel}>Validez: </Text>
                <Text style={commonStyles.documentInfoValue}>{quotation.validityDays} días</Text>
              </Text>
            </View>
            <View style={commonStyles.col2}>
              <Text style={commonStyles.documentInfo}>
                <Text style={commonStyles.documentInfoLabel}>Moneda: </Text>
                <Text style={commonStyles.documentInfoValue}>{quotation.currency}</Text>
              </Text>
            </View>
          </View>
          {quotation.equipmentReleaseDate && (
            <View style={commonStyles.row}>
              <View style={commonStyles.col2}>
                <Text style={commonStyles.documentInfo}>
                  <Text style={commonStyles.documentInfoLabel}>Entrega de equipos: </Text>
                  <Text style={commonStyles.documentInfoValue}>
                    {formatUtils.date(quotation.equipmentReleaseDate)}
                  </Text>
                </Text>
              </View>
              {quotation.returnDate && (
                <View style={commonStyles.col2}>
                  <Text style={commonStyles.documentInfo}>
                    <Text style={commonStyles.documentInfoLabel}>Fecha de devolución: </Text>
                    <Text style={commonStyles.documentInfoValue}>
                      {formatUtils.date(quotation.returnDate)}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          )}
          {quotation.monitoringLocation && (
            <Text style={commonStyles.documentInfo}>
              <Text style={commonStyles.documentInfoLabel}>Lugar de monitoreo: </Text>
              <Text style={commonStyles.documentInfoValue}>{quotation.monitoringLocation}</Text>
            </Text>
          )}
        </View>

        {/* Client Information */}
        <View style={quotationStyles.clientBox}>
          <Text style={quotationStyles.clientTitle}>INFORMACIÓN DEL CLIENTE</Text>
          <Text style={quotationStyles.clientInfo}>
            <Text style={commonStyles.textBold}>Cliente: </Text>{quotation.client.name}
          </Text>
          <Text style={quotationStyles.clientInfo}>
            <Text style={commonStyles.textBold}>RUC: </Text>{quotation.client.ruc}
          </Text>
          <Text style={quotationStyles.clientInfo}>
            <Text style={commonStyles.textBold}>Dirección: </Text>{quotation.client.address}
          </Text>
          <Text style={quotationStyles.clientInfo}>
            <Text style={commonStyles.textBold}>Email: </Text>{quotation.client.email}
          </Text>
        </View>

        {/* Items Table */}
        <Text style={commonStyles.sectionTitle}>DETALLE DE SERVICIOS</Text>
        <View style={commonStyles.table}>
          {/* Header */}
          <View style={commonStyles.tableHeader}>
            <Text style={quotationStyles.col1}>Código</Text>
            <Text style={quotationStyles.col2}>Descripción</Text>
            <Text style={[quotationStyles.col3, commonStyles.textCenter]}>Cant.</Text>
            <Text style={[quotationStyles.col4, commonStyles.textCenter]}>Días</Text>
            <Text style={[quotationStyles.col5, commonStyles.textRight]}>P. Unit</Text>
            <Text style={[quotationStyles.col6, commonStyles.textRight]}>Subtotal</Text>
            <Text style={[quotationStyles.col7, commonStyles.textRight]}>Total</Text>
          </View>
          
          {/* Rows */}
          {quotation.items.map((item, index) => {
            const subtotal = item.unitPrice * item.quantity;
            const total = subtotal * item.days;
            
            return (
              <View
                key={index}
                style={index % 2 === 0 ? commonStyles.tableRow : commonStyles.tableRowAlt}
              >
                <Text style={quotationStyles.col1}>{item.code}</Text>
                <View style={quotationStyles.col2}>
                  <Text style={[commonStyles.tableCell, commonStyles.textBold]}>{item.name}</Text>
                  <Text style={[commonStyles.tableCell, commonStyles.textSmall, commonStyles.textMuted]}>
                    {item.description}
                  </Text>
                </View>
                <Text style={[quotationStyles.col3, commonStyles.textCenter]}>{item.quantity}</Text>
                <Text style={[quotationStyles.col4, commonStyles.textCenter]}>{item.days}</Text>
                <Text style={[quotationStyles.col5, commonStyles.textRight]}>
                  {formatUtils.currency(item.unitPrice, quotation.currency)}
                </Text>
                <Text style={[quotationStyles.col6, commonStyles.textRight]}>
                  {formatUtils.currency(subtotal, quotation.currency)}
                </Text>
                <Text style={[quotationStyles.col7, commonStyles.textRight]}>
                  {formatUtils.currency(total, quotation.currency)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={commonStyles.totalsSection}>
          <View style={commonStyles.totalRow}>
            <Text style={commonStyles.totalLabel}>Subtotal:</Text>
            <Text style={commonStyles.totalValue}>
              {formatUtils.currency(quotation.subtotal, quotation.currency)}
            </Text>
          </View>
          <View style={commonStyles.totalRow}>
            <Text style={commonStyles.totalLabel}>IGV (18%):</Text>
            <Text style={commonStyles.totalValue}>
              {formatUtils.currency(quotation.igv, quotation.currency)}
            </Text>
          </View>
          <View style={[commonStyles.totalRow, commonStyles.totalFinal]}>
            <Text style={commonStyles.totalFinalLabel}>TOTAL:</Text>
            <Text style={commonStyles.totalFinalValue}>
              {formatUtils.currency(quotation.total, quotation.currency)}
            </Text>
          </View>
        </View>

        {/* Bank Account Information */}
        {quotation.company?.bankAccount && (
          <View style={quotationStyles.bankSection}>
            <Text style={quotationStyles.bankTitle}>DATOS BANCARIOS PARA PAGO</Text>
            <Text style={quotationStyles.bankInfo}>
              <Text style={commonStyles.textBold}>Banco: </Text>
              {quotation.company.bankAccount.bankName}
            </Text>
            <Text style={quotationStyles.bankInfo}>
              <Text style={commonStyles.textBold}>Número de Cuenta: </Text>
              {quotation.company.bankAccount.accountNumber}
            </Text>
            <Text style={quotationStyles.bankInfo}>
              <Text style={commonStyles.textBold}>Tipo: </Text>
              {quotation.company.bankAccount.accountType} - {quotation.company.bankAccount.currency}
            </Text>
          </View>
        )}

        {/* Notes */}
        {quotation.notes && (
          <View style={commonStyles.notesSection}>
            <Text style={commonStyles.notesTitle}>NOTAS Y CONDICIONES</Text>
            <Text style={commonStyles.notesText}>{quotation.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <PDFFooter
          company={quotation.company ? {
            name: quotation.company.name,
            email: quotation.company.email,
            phone: quotation.company.phone,
          } : undefined}
          customText="Cotización generada automáticamente"
        />
      </Page>
    </Document>
  );
};
