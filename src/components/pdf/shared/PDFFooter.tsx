import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { commonStyles } from './pdf-styles';

interface CompanyInfo {
  name: string;
  email: string;
  phone: string;
}

interface PDFFooterProps {
  company?: CompanyInfo;
  customText?: string;
  showPageNumber?: boolean;
}

export const PDFFooter: React.FC<PDFFooterProps> = ({
  company,
  customText,
  showPageNumber = true,
}) => {
  return (
    <>
      {/* Footer */}
      <View style={commonStyles.footer}>
        {customText && (
          <Text style={commonStyles.footerText}>
            {customText}
          </Text>
        )}
        {company && (
          <Text style={commonStyles.footerCompanyInfo}>
            {company.name} | {company.email} | {company.phone}
          </Text>
        )}
      </View>

      {/* Page Number */}
      {showPageNumber && (
        <Text 
          style={commonStyles.pageNumber} 
          render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} 
          fixed 
        />
      )}
    </>
  );
};

