import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { commonStyles as defaultStyles, type PdfTheme } from './pdf-styles';

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
  theme?: PdfTheme;
}

const resolveLogoSource = (logo?: string | null) => {
  if (!logo || logo.trim() === '') {
    return `${process.cwd()}/public/logo.png`;
  }

  if (logo.startsWith('http') || logo.startsWith('data:')) {
    return logo;
  }

  if (logo.startsWith('/')) {
    return `${process.cwd()}/public${logo}`;
  }

  return `${process.cwd()}/public/${logo}`;
};

export const PDFHeader: React.FC<PDFHeaderProps> = ({
  company,
  documentTitle,
  documentNumber,
  documentDate,
  showCompanyInfo = true,
  theme,
}) => {
  const logoPath = resolveLogoSource(company?.logo);
  const styles = theme?.styles ?? defaultStyles;

  return (
    <View style={styles.header}>
      {/* Left side - Company info */}
      <View style={styles.headerLeft}>
        <View style={styles.logoContainer}>
          <Image src={logoPath} style={styles.logo} />
        </View>
        {showCompanyInfo && company && (
          <View>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companyInfo}>RUC: {company.ruc}</Text>
            <Text style={styles.companyInfo}>{company.address}</Text>
            <Text style={styles.companyInfo}>{company.email}</Text>
            <Text style={styles.companyInfo}>{company.phone}</Text>
          </View>
        )}
      </View>

      {/* Right side - Document info */}
      <View style={styles.headerRight}>
        <Text style={styles.title}>{documentTitle}</Text>
        {documentNumber && (
          <Text style={styles.subtitle}>Nº {documentNumber}</Text>
        )}
        {documentDate && (
          <Text style={styles.subtitle}>Fecha: {documentDate}</Text>
        )}
      </View>
    </View>
  );
};

