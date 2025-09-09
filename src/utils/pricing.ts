// Pricing configuration
export const PRICING_CONFIG = {
  INDIVIDUAL_CLASS_PRICE_BEFORE_AUGUST_31: 10, // $10 (legacy pricing)
  INDIVIDUAL_CLASS_PRICE_AFTER_AUGUST_31: 14,   // $14 (current pricing)
  PRICE_CHANGE_DATE: new Date('2025-08-31'),    // Price change date
  PACKAGE_PRICE: 40,                            // $40 for 4-class package
  PACKAGE_CLASSES: 4                            // 4 classes per package
};

/**
 * Get the individual class price based on the class date
 */
export function getIndividualClassPrice(date: Date = new Date()): number {
  // Normalize the date to start of day in UTC for consistent comparison
  const normalizedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const august31 = new Date(Date.UTC(2025, 7, 31)); // August 31, 2025 (month is 0-indexed)
  
  if (normalizedDate > august31) {
    return PRICING_CONFIG.INDIVIDUAL_CLASS_PRICE_AFTER_AUGUST_31;
  }
  return PRICING_CONFIG.INDIVIDUAL_CLASS_PRICE_BEFORE_AUGUST_31;
}

/**
 * Get the individual class price for a given date
 * $10 for classes on or before August 31, 2025, $14 after
 */
export function getCurrentIndividualClassPrice(): number {
  return getClassPriceForDate(new Date());
}

/**
 * Get the individual class price for a specific class date
 * Note: This should be used when booking classes to get the correct price for that class date
 */
export function getClassPriceForDate(classDate: Date): number {
  // Normalize the date to start of day in UTC for consistent comparison
  const normalizedDate = new Date(Date.UTC(classDate.getFullYear(), classDate.getMonth(), classDate.getDate()));
  const august31 = new Date(Date.UTC(2025, 7, 31)); // August 31, 2025 (month is 0-indexed)
  return normalizedDate <= august31 ? 10 : 14; // $10 on or before Aug 31, $14 after
}

// Get price for a specific class, using custom price if set, otherwise falling back to date-based pricing
export function getClassPrice(classItem: { price?: number | null, date: string | Date }): number {
  // If class has a custom price, use that
  if (classItem.price !== null && classItem.price !== undefined) {
    return classItem.price;
  }
  
  // Otherwise, use date-based pricing
  const classDate = typeof classItem.date === 'string' ? new Date(classItem.date) : classItem.date;
  return getClassPriceForDate(classDate);
}

/**
 * Get the package price
 */
export function getPackagePrice(): number {
  return PRICING_CONFIG.PACKAGE_PRICE;
}

/**
 * Calculate savings when using package vs individual classes
 */
export function calculatePackageSavings(): number {
  const individualPrice = getCurrentIndividualClassPrice();
  const totalIndividualCost = individualPrice * PRICING_CONFIG.PACKAGE_CLASSES;
  const packageCost = PRICING_CONFIG.PACKAGE_PRICE;
  return totalIndividualCost - packageCost;
}

/**
 * Get package savings percentage
 */
export function getPackageSavingsPercentage(): number {
  const individualPrice = getCurrentIndividualClassPrice();
  const totalIndividualCost = individualPrice * PRICING_CONFIG.PACKAGE_CLASSES;
  const savings = calculatePackageSavings();
  return Math.round((savings / totalIndividualCost) * 100);
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Check if a date is after the price change
 */
export function isAfterPriceChange(date: Date = new Date()): boolean {
  return date >= PRICING_CONFIG.PRICE_CHANGE_DATE;
} 