import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { commonStyles, colors } from './pdf-styles';

interface CompanyInfo {
  name: string;
  ruc: string;
  address: string;
  email: string;
  phone: string;
  logo?: string | null;
}

interface PDFHeaderProps {
  company?: CompanyInfo;
  documentTitle: string;
  documentNumber?: string;
  documentDate?: string;
  showCompanyInfo?: boolean;
}

export const PDFHeader: React.FC<PDFHeaderProps> = ({ 
  company, 
  documentTitle, 
  documentNumber,
  documentDate,
  showCompanyInfo = true 
}) => {
  const logoPath = company?.logo || '/logo.png';

  return (
    <View style={commonStyles.header}>
      {/* Left side - Company info */}
      <View style={commonStyles.headerLeft}>
        <View style={commonStyles.logoContainer}>
          <Image
            src={logoPath}
            style={commonStyles.logo}
          />
        </View>
        {showCompanyInfo && company && (
          <View>
            <Text style={commonStyles.companyName}>{company.name}</Text>
            <Text style={commonStyles.companyInfo}>RUC: {company.ruc}</Text>
            <Text style={commonStyles.companyInfo}>{company.address}</Text>
            <Text style={commonStyles.companyInfo}>{company.email}</Text>
            <Text style={commonStyles.companyInfo}>{company.phone}</Text>
          </View>
        )}
      </View>

      {/* Right side - Document info */}
      <View style={commonStyles.headerRight}>
        <Text style={commonStyles.title}>{documentTitle}</Text>
        {documentNumber && (
          <Text style={commonStyles.subtitle}>Nº {documentNumber}</Text>
        )}
        {documentDate && (
          <Text style={commonStyles.subtitle}>Fecha: {documentDate}</Text>
        )}
      </View>
    </View>
  );
};

