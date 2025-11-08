import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { commonStyles as defaultStyles, type PdfTheme } from './pdf-styles';

interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
}

interface PDFFooterProps {
  company?: CompanyInfo;
  customText?: string;
  showPageNumber?: boolean;
  theme?: PdfTheme;
}

export const PDFFooter: React.FC<PDFFooterProps> = ({
  company,
  customText,
  showPageNumber = true,
  theme,
}) => {
  const styles = theme?.styles ?? defaultStyles;

  return (
    <>
      {/* Footer */}
      <View style={styles.footer}>
        {customText && (
          <Text style={styles.footerText}>
            {customText}
          </Text>
        )}
        {company && (
          <Text style={styles.footerCompanyInfo}>
            {company.name} | {company.email} | {company.phone}
          </Text>
        )}
      </View>

      {/* Page Number */}
      {showPageNumber && (
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} 
          fixed 
        />
      )}
    </>
  );
};

