/**
 * Pillar 26: Calculated Fabric Engineering & Pattern Making
 * Core math utility for Parametric Yardage Calculations.
 * Kept in lib/engine to remain highly decoupled and testable (per user review).
 */

export function calculateParametricYardage(heightCm: number, chestCm: number, isCape: boolean = false) {
  // A mock algorithm determining fabric yardage based on precise measurements
  
  const baseYardage = (heightCm * 0.02) + (chestCm * 0.015);
  
  // E.g., specialized floor-length capes require an extra 1.5 yards of fabric
  const finalYardage = isCape ? baseYardage + 1.5 : baseYardage;

  return {
    calculatedYardage: parseFloat(finalYardage.toFixed(2)),
    patternGridReference: `PATT-${heightCm}-${chestCm}${isCape ? '-CAPE' : ''}`,
    manufactureReady: true
  };
}
