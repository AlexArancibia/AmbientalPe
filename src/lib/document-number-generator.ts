/**
 * Utilidades para generar números de documentos automáticamente
 * Extrae el último número de un código y genera el siguiente
 * Ejemplo: COT-2024-800 -> COT-2024-801
 */

/**
 * Extrae el último número de un código de documento
 * @param code Código del documento (ej: "COT-2024-800")
 * @returns El número extraído o 0 si no se encuentra
 */
export function extractLastNumber(code: string): number {
  // Buscar todos los números en el código
  const numbers = code.match(/\d+/g);
  
  if (!numbers || numbers.length === 0) {
    return 0;
  }
  
  // Tomar el último número encontrado
  const lastNumber = numbers[numbers.length - 1];
  if (!lastNumber) {
    return 0;
  }
  
  return parseInt(lastNumber, 10);
}

/**
 * Genera el siguiente número de documento basado en una lista de códigos existentes
 * @param existingCodes Array de códigos existentes
 * @param prefix Prefijo del código (ej: "COT-2024-")
 * @returns El siguiente código generado
 */
export function generateNextDocumentNumber(
  existingCodes: string[],
  prefix: string
): string {
  if (existingCodes.length === 0) {
    // Si no hay códigos existentes, empezar en 001
    return `${prefix}001`;
  }

  // Extraer todos los números
  const numbers = existingCodes.map(code => extractLastNumber(code));
  
  // Encontrar el número más alto
  const maxNumber = Math.max(...numbers, 0); // Asegurar al menos 0
  
  // Generar el siguiente número
  const nextNumber = maxNumber + 1;
  
  // Formatear con ceros a la izquierda (3 dígitos)
  const formattedNumber = nextNumber.toString().padStart(3, '0');
  
  return `${prefix}${formattedNumber}`;
}

/**
 * Obtiene el prefijo actual basado en el año
 * @param documentType Tipo de documento ("COT", "OS", "OC")
 * @returns Prefijo con el año actual (ej: "COT-2024-")
 */
export function getCurrentPrefix(documentType: 'COT' | 'OS' | 'OC'): string {
  const currentYear = new Date().getFullYear();
  return `${documentType}-${currentYear}-`;
}

/**
 * Genera el siguiente número de cotización
 * @param existingQuotations Array de números de cotización existentes
 * @returns El siguiente número de cotización
 */
export function generateNextQuotationNumber(existingQuotations: string[]): string {
  const prefix = getCurrentPrefix('COT');
  
  // Filtrar solo las cotizaciones del año actual
  const currentYearQuotations = existingQuotations.filter(code => 
    code.startsWith(prefix)
  );
  
  return generateNextDocumentNumber(currentYearQuotations, prefix);
}

/**
 * Genera el siguiente número de orden de servicio
 * @param existingOrders Array de números de orden de servicio existentes
 * @returns El siguiente número de orden de servicio
 */
export function generateNextServiceOrderNumber(existingOrders: string[]): string {
  const prefix = getCurrentPrefix('OS');
  
  // Filtrar solo las órdenes del año actual
  const currentYearOrders = existingOrders.filter(code => 
    code.startsWith(prefix)
  );
  
  return generateNextDocumentNumber(currentYearOrders, prefix);
}

/**
 * Genera el siguiente número de orden de compra
 * @param existingOrders Array de números de orden de compra existentes
 * @returns El siguiente número de orden de compra
 */
export function generateNextPurchaseOrderNumber(existingOrders: string[]): string {
  const prefix = getCurrentPrefix('OC');
  
  // Filtrar solo las órdenes del año actual
  const currentYearOrders = existingOrders.filter(code => 
    code.startsWith(prefix)
  );
  
  return generateNextDocumentNumber(currentYearOrders, prefix);
}
