import { describe, it, expect } from 'vitest';
import { calculateParametricYardage } from '../fabric';

describe('Parametric Fabric Engine (Pillar 26)', () => {
  it('should calculate base yardage for standard measurements', () => {
    // height: 180cm, chest: 100cm, isCape: false
    const yardage = calculateParametricYardage(180, 100, false);
    // (180 * 0.02) + (100 * 0.015) = 3.6 + 1.5 = 5.1
    expect(yardage.calculatedYardage).toBeCloseTo(5.1, 2);
    expect(yardage.patternGridReference).toBe('PATT-180-100');
  });

  it('should apply additional yardage logic for special items (e.g. capes)', () => {
    const yardage = calculateParametricYardage(180, 100, true);
    // 5.1 + 1.5 = 6.6
    expect(yardage.calculatedYardage).toBeCloseTo(6.6, 2);
    expect(yardage.patternGridReference).toBe('PATT-180-100-CAPE');
  });
});
