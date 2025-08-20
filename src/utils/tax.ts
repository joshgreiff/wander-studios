// Sales tax rates by state (simplified - you may want to use a more comprehensive tax service)
const STATE_TAX_RATES: { [key: string]: number } = {
  'AL': 0.04, // Alabama
  'AK': 0.00, // Alaska (no state sales tax)
  'AZ': 0.056, // Arizona
  'AR': 0.065, // Arkansas
  'CA': 0.0725, // California
  'CO': 0.029, // Colorado
  'CT': 0.0635, // Connecticut
  'DE': 0.00, // Delaware (no state sales tax)
  'FL': 0.06, // Florida
  'GA': 0.04, // Georgia
  'HI': 0.04, // Hawaii
  'ID': 0.06, // Idaho
  'IL': 0.0625, // Illinois
  'IN': 0.07, // Indiana
  'IA': 0.06, // Iowa
  'KS': 0.065, // Kansas
  'KY': 0.06, // Kentucky
  'LA': 0.0445, // Louisiana
  'ME': 0.055, // Maine
  'MD': 0.06, // Maryland
  'MA': 0.0625, // Massachusetts
  'MI': 0.06, // Michigan
  'MN': 0.06875, // Minnesota
  'MS': 0.07, // Mississippi
  'MO': 0.04225, // Missouri
  'MT': 0.00, // Montana (no state sales tax)
  'NE': 0.055, // Nebraska
  'NV': 0.0685, // Nevada
  'NH': 0.00, // New Hampshire (no state sales tax)
  'NJ': 0.06625, // New Jersey
  'NM': 0.05125, // New Mexico
  'NY': 0.04, // New York
  'NC': 0.0475, // North Carolina
  'ND': 0.05, // North Dakota
  'OH': 0.0575, // Ohio
  'OK': 0.045, // Oklahoma
  'OR': 0.00, // Oregon (no state sales tax)
  'PA': 0.06, // Pennsylvania
  'RI': 0.07, // Rhode Island
  'SC': 0.06, // South Carolina
  'SD': 0.045, // South Dakota
  'TN': 0.07, // Tennessee
  'TX': 0.0625, // Texas
  'UT': 0.061, // Utah
  'VT': 0.06, // Vermont
  'VA': 0.053, // Virginia
  'WA': 0.065, // Washington
  'WV': 0.06, // West Virginia
  'WI': 0.05, // Wisconsin
  'WY': 0.04, // Wyoming
};

// Local tax rates for major cities (simplified)
const LOCAL_TAX_RATES: { [key: string]: number } = {
  'NYC': 0.045, // New York City
  'LA': 0.01, // Los Angeles
  'CHI': 0.0125, // Chicago
  'HOU': 0.0125, // Houston
  'PHX': 0.023, // Phoenix
  'PHI': 0.02, // Philadelphia
  'SAN': 0.01, // San Antonio
  'SD': 0.01, // San Diego
  'DAL': 0.02, // Dallas
  'SJ': 0.01, // San Jose
  'AUS': 0.01, // Austin
  'JAX': 0.01, // Jacksonville
  'FTW': 0.01, // Fort Worth
  'COL': 0.01, // Columbus
  'CHA': 0.01, // Charlotte
  'SF': 0.01, // San Francisco
  'IND': 0.01, // Indianapolis
  'SEA': 0.01, // Seattle
  'DEN': 0.01, // Denver
  'WAS': 0.01, // Washington DC
  'BOS': 0.01, // Boston
  'ELP': 0.01, // El Paso
  'NASH': 0.01, // Nashville
  'DET': 0.01, // Detroit
  'OKC': 0.01, // Oklahoma City
  'POR': 0.01, // Portland
  'LV': 0.01, // Las Vegas
  'MEM': 0.01, // Memphis
  'LOU': 0.01, // Louisville
  'BAL': 0.01, // Baltimore
  'MIL': 0.01, // Milwaukee
  'ALB': 0.01, // Albuquerque
  'TUC': 0.01, // Tucson
  'FRES': 0.01, // Fresno
  'SAC': 0.01, // Sacramento
  'MESA': 0.01, // Mesa
  'KC': 0.01, // Kansas City
  'ATL': 0.01, // Atlanta
  'LONG': 0.01, // Long Beach
  'COLO': 0.01, // Colorado Springs
  'RALE': 0.01, // Raleigh
  'MIA': 0.01, // Miami
  'VIRG': 0.01, // Virginia Beach
  'OMA': 0.01, // Omaha
  'OAK': 0.01, // Oakland
  'MINN': 0.01, // Minneapolis
  'TUL': 0.01, // Tulsa
  'ARL': 0.01, // Arlington
  'TAM': 0.01, // Tampa
  'NEW': 0.01, // New Orleans
  'WICH': 0.01, // Wichita
  'CLE': 0.01, // Cleveland
  'BUF': 0.01, // Buffalo
};

export interface TaxCalculation {
  subtotal: number;
  stateTax: number;
  localTax: number;
  totalTax: number;
  total: number;
  stateRate: number;
  localRate: number;
}

export function calculateSalesTax(
  subtotal: number,
  stateCode: string,
  cityCode?: string
): TaxCalculation {
  const stateRate = STATE_TAX_RATES[stateCode.toUpperCase()] || 0;
  const localRate = cityCode ? LOCAL_TAX_RATES[cityCode.toUpperCase()] || 0 : 0;
  
  const stateTax = subtotal * stateRate;
  const localTax = subtotal * localRate;
  const totalTax = stateTax + localTax;
  const total = subtotal + totalTax;

  return {
    subtotal,
    stateTax,
    localTax,
    totalTax,
    total,
    stateRate,
    localRate,
  };
}

export function formatTaxCalculation(taxCalc: TaxCalculation): string {
  const { subtotal, stateTax, localTax, totalTax, total, stateRate, localRate } = taxCalc;
  
  let breakdown = `Subtotal: $${subtotal.toFixed(2)}`;
  
  if (stateTax > 0) {
    breakdown += `\nState Tax (${(stateRate * 100).toFixed(2)}%): $${stateTax.toFixed(2)}`;
  }
  
  if (localTax > 0) {
    breakdown += `\nLocal Tax (${(localRate * 100).toFixed(2)}%): $${localTax.toFixed(2)}`;
  }
  
  breakdown += `\nTotal Tax: $${totalTax.toFixed(2)}`;
  breakdown += `\nTotal: $${total.toFixed(2)}`;
  
  return breakdown;
}

// Helper function to get state code from address
export function extractStateFromAddress(address: string): string | null {
  const stateMatch = address.match(/\b([A-Z]{2})\s*\d{5}/);
  return stateMatch ? stateMatch[1] : null;
}

// Helper function to get city code from address (simplified)
export function extractCityFromAddress(address: string): string | null {
  // This is a simplified implementation
  // In a real application, you'd want to use a more sophisticated address parsing service
  const cityMatch = address.match(/^([^,]+),/);
  return cityMatch ? cityMatch[1].trim().toUpperCase() : null;
} 