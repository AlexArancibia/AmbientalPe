import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { commonStyles as defaultStyles, type PdfTheme } from './pdf-styles';

export interface PdfBankAccount {
  bankName: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  isDefault?: boolean;
  isDetraction?: boolean;
}

interface PDFBankAccountsSectionProps {
  accounts?: PdfBankAccount[] | null;
  theme?: PdfTheme;
}

const accountTypeLabels: Record<string, string> = {
  CORRIENTE: 'Corriente',
  AHORROS: 'Ahorros',
  CCI: 'CCI',
  DETRACCION: 'Detracción',
};

const renderAccount = (
  styles: typeof defaultStyles,
  account: PdfBankAccount,
  label?: string,
  key?: string,
) => {
  const typeKey = account.accountType?.toUpperCase?.() ?? '';
  const typeLabel = accountTypeLabels[typeKey] ?? account.accountType;

  return (
    <View key={key} style={styles.bankAccountCard}>
      {label && <Text style={styles.bankAccountLabel}>{label}</Text>}
      <View style={styles.bankAccountItem}>
        <Text style={styles.bankAccountLine}>
          <Text style={styles.textBold}>Banco: </Text>
          {account.bankName}
        </Text>
      </View>
      <View style={styles.bankAccountItem}>
        <Text style={styles.bankAccountLine}>
          <Text style={styles.textBold}>Cuenta: </Text>
          {account.accountNumber}
        </Text>
      </View>
      <View style={styles.bankAccountItem}>
        <Text style={styles.bankAccountLine}>
          <Text style={styles.textBold}>Tipo / Moneda: </Text>
          {typeLabel} - {account.currency}
        </Text>
      </View>
    </View>
  );
};

const renderOtherAccounts = (styles: typeof defaultStyles, accounts: PdfBankAccount[]) => {
  if (accounts.length === 0) return null;

  const chunkSize = 2;
  const rows: PdfBankAccount[][] = [];
  for (let i = 0; i < accounts.length; i += chunkSize) {
    rows.push(accounts.slice(i, i + chunkSize));
  }

  return rows.map((row, rowIndex) => (
    <View key={`otras-cuentas-row-${rowIndex}`} style={[styles.bankAccountCard, { flexBasis: '100%' }]}>
      {rowIndex === 0 && <Text style={styles.bankAccountLabel}>Otras cuentas</Text>}
      <View style={[styles.bankAccountGrid, { gap: 4 }]}>
        {row.map((account, index) => {
          const typeKey = account.accountType?.toUpperCase?.() ?? '';
          const typeLabel = accountTypeLabels[typeKey] ?? account.accountType;

          return (
            <View
              key={`${account.bankName}-${account.accountNumber}-${rowIndex}-${index}`}
              style={[styles.bankAccountCard, { flexBasis: '48%', padding: 6 }]}
            >
              <View style={styles.bankAccountItem}>
                <Text style={styles.bankAccountLine}>
                  <Text style={styles.textBold}>Banco: </Text>
                  {account.bankName}
                </Text>
              </View>
              <View style={styles.bankAccountItem}>
                <Text style={styles.bankAccountLine}>
                  <Text style={styles.textBold}>Cuenta: </Text>
                  {account.accountNumber}
                </Text>
              </View>
              <View style={styles.bankAccountItem}>
                <Text style={styles.bankAccountLine}>
                  <Text style={styles.textBold}>Tipo / Moneda: </Text>
                  {typeLabel} - {account.currency}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  ));
};

export const PDFBankAccountsSection: React.FC<PDFBankAccountsSectionProps> = ({
  accounts,
  theme,
}) => {
  if (!accounts || accounts.length === 0) {
    return null;
  }

  const defaultAccount = accounts.find((account) => account.isDefault);
  const detractionAccount = accounts.find((account) => account.isDetraction);
  const secondaryAccounts = accounts.filter(
    (account) => !account.isDefault && !account.isDetraction,
  );

  if (!defaultAccount && !detractionAccount && secondaryAccounts.length === 0) {
    return null;
  }

  const styles = theme?.styles ?? defaultStyles;

  return (
    <View style={styles.bankSection}>
      <Text style={styles.bankSectionTitle}>Datos bancarios para pago</Text>
      <View style={styles.bankAccountGrid}>
        {defaultAccount &&
          renderAccount(
            styles,
            defaultAccount,
            'Cuenta principal',
            `${defaultAccount.bankName}-${defaultAccount.accountNumber}-principal`,
          )}
        {detractionAccount &&
          renderAccount(
            styles,
            detractionAccount,
            'Cuenta de detracción',
            `${detractionAccount.bankName}-${detractionAccount.accountNumber}-detraccion`,
          )}
        {secondaryAccounts.length > 0 && renderOtherAccounts(styles, secondaryAccounts)}
      </View>
    </View>
  );
};

