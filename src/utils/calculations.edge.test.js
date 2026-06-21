import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmissions,
  calculateHousingEmissions,
  calculateFoodEmissions,
  calculateShoppingEmissions,
  calculateWasteEmissions,
  calculateTotalFootprint,
  calculateEquivalencies,
  EMISSION_FACTORS,
} from './calculations';

describe('Edge Case & Boundary Tests', () => {
  describe('calculateTransportEmissions — edge cases', () => {
    it('returns 0 for undefined input', () => {
      expect(calculateTransportEmissions(undefined)).toBe(0);
    });

    it('treats NaN driving distance as 0', () => {
      expect(calculateTransportEmissions({ drivingKm: NaN })).toBe(0);
    });

    it('treats string numeric inputs as numbers', () => {
      const expected = (5000 * EMISSION_FACTORS.transport.gasolineVehicle) / 1000;
      expect(calculateTransportEmissions({ drivingKm: '5000', vehicleType: 'gasolineVehicle' })).toBe(expected);
    });

    it('handles electric vehicle factor correctly', () => {
      const expected = (10000 * EMISSION_FACTORS.transport.electricVehicle) / 1000;
      expect(calculateTransportEmissions({ drivingKm: 10000, vehicleType: 'electricVehicle' })).toBe(expected);
    });

    it('handles hybrid vehicle type', () => {
      const expected = (5000 * EMISSION_FACTORS.transport.hybridVehicle) / 1000;
      expect(calculateTransportEmissions({ drivingKm: 5000, vehicleType: 'hybridVehicle' })).toBe(expected);
    });

    it('does not return negative values for any combination', () => {
      const result = calculateTransportEmissions({ drivingKm: -1000, publicTransitKm: -500 });
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateHousingEmissions — edge cases', () => {
    it('returns 0 for all-zero inputs', () => {
      expect(calculateHousingEmissions({ electricityKwh: 0, gasTherms: 0, waterLitres: 0 })).toBe(0);
    });

    it('handles string numeric inputs', () => {
      const result = calculateHousingEmissions({ electricityKwh: '100', gasTherms: '10', waterLitres: '1000' });
      expect(result).toBeGreaterThan(0);
    });

    it('multiplies monthly electricity by 12 for annual total', () => {
      const monthly = 100;
      const expected = (monthly * EMISSION_FACTORS.housing.electricityKwh * 12) / 1000;
      expect(calculateHousingEmissions({ electricityKwh: monthly, gasTherms: 0, waterLitres: 0 })).toBeCloseTo(expected, 3);
    });
  });

  describe('calculateFoodEmissions — edge cases', () => {
    it('handles undefined dietType gracefully', () => {
      const result = calculateFoodEmissions({ dietType: undefined });
      expect(result).toBeCloseTo((EMISSION_FACTORS.diet.lowMeat * 365) / 1000, 3);
    });

    it('returns correct value for highMeat diet', () => {
      const expected = (EMISSION_FACTORS.diet.highMeat * 365) / 1000;
      expect(calculateFoodEmissions({ dietType: 'highMeat' })).toBeCloseTo(expected, 3);
    });

    it('returns correct value for vegetarian diet', () => {
      const expected = (EMISSION_FACTORS.diet.vegetarian * 365) / 1000;
      expect(calculateFoodEmissions({ dietType: 'vegetarian' })).toBeCloseTo(expected, 3);
    });
  });

  describe('calculateShoppingEmissions — edge cases', () => {
    it('returns 0 for undefined inputs', () => {
      expect(calculateShoppingEmissions(undefined)).toBe(0);
    });

    it('treats NaN inputs as 0', () => {
      expect(calculateShoppingEmissions({ clothingSpend: NaN, electronicsSpend: NaN })).toBe(0);
    });

    it('treats string numeric inputs as numbers', () => {
      const expected = (100 * EMISSION_FACTORS.shopping.clothingSpend + 50 * EMISSION_FACTORS.shopping.electronicsSpend) * 12 / 1000;
      expect(calculateShoppingEmissions({ clothingSpend: '100', electronicsSpend: '50' })).toBe(expected);
    });
  });

  describe('calculateWasteEmissions — edge cases', () => {
    it('handles 100% recycling rate (returns 0)', () => {
      expect(calculateWasteEmissions({ wasteKg: 10, recyclingRate: 100 })).toBe(0);
    });

    it('clamps recycling rate above 100 to 100', () => {
      expect(calculateWasteEmissions({ wasteKg: 10, recyclingRate: 200 })).toBe(0);
    });

    it('treats negative recycling rate as 0%', () => {
      const expected = calculateWasteEmissions({ wasteKg: 10, recyclingRate: 0 });
      expect(calculateWasteEmissions({ wasteKg: 10, recyclingRate: -100 })).toBe(expected);
    });

    it('handles NaN waste input as 0', () => {
      expect(calculateWasteEmissions({ wasteKg: NaN, recyclingRate: 50 })).toBe(0);
    });
  });

  describe('calculateTotalFootprint — aggregation', () => {
    it('returns all zero breakdown when given empty inputs', () => {
      const result = calculateTotalFootprint({});
      expect(result.total).toBe(result.breakdown.food);
      expect(result.breakdown.transport).toBe(0);
      expect(result.breakdown.housing).toBe(0);
      expect(result.breakdown.food).toBeGreaterThan(0); // food has a default diet
    });

    it('total equals sum of all breakdown categories', () => {
      const profile = {
        transport: { drivingKm: 8000, vehicleType: 'gasolineVehicle' },
        housing:   { electricityKwh: 300, gasTherms: 25, waterLitres: 5000 },
        food:      { dietType: 'lowMeat' },
        waste:     { wasteKg: 6, recyclingRate: 40 },
      };
      const result = calculateTotalFootprint(profile);
      const breakdownSum = parseFloat(
        (result.breakdown.transport + result.breakdown.housing + result.breakdown.food + result.breakdown.waste).toFixed(3)
      );
      expect(result.total).toBe(breakdownSum);
    });
  });

  describe('calculateEquivalencies — correctness', () => {
    it('returns 0 trees for 0 tonnes', () => {
      const result = calculateEquivalencies(0);
      expect(result.treesPlanted).toBe(0);
    });

    it('returns positive values for positive input', () => {
      const result = calculateEquivalencies(5);
      expect(result.treesPlanted).toBeGreaterThan(0);
      expect(result.smartphonesCharged).toBeGreaterThan(0);
    });

    it('handles NaN input gracefully', () => {
      const result = calculateEquivalencies(NaN);
      expect(result.treesPlanted).toBe(0);
    });
  });
});
