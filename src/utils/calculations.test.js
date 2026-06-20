import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmissions,
  calculateHousingEmissions,
  calculateFoodEmissions,
  calculateWasteEmissions,
  calculateTotalFootprint,
  calculateEquivalencies,
  EMISSION_FACTORS,
} from './calculations';

describe('Carbon Footprint Calculation Suite', () => {
  describe('Transportation Emissions', () => {
    it('should return 0 when all inputs are 0 or empty', () => {
      expect(calculateTransportEmissions()).toBe(0);
      expect(calculateTransportEmissions({})).toBe(0);
    });

    it('should correctly calculate emissions for gasoline driving', () => {
      const distance = 10000; // 10000 km
      const expected = (distance * EMISSION_FACTORS.transport.gasolineVehicle) / 1000;
      expect(calculateTransportEmissions({ drivingKm: distance, vehicleType: 'gasolineVehicle' })).toBe(expected);
    });

    it('should fall back to gasoline vehicle if type is invalid', () => {
      const distance = 5000;
      const expected = (distance * EMISSION_FACTORS.transport.gasolineVehicle) / 1000;
      expect(calculateTransportEmissions({ drivingKm: distance, vehicleType: 'unknownType' })).toBe(expected);
    });

    it('should sum multiple transportation activities correctly', () => {
      const inputs = {
        drivingKm: 1000, // Gasoline: 220 kg
        publicTransitKm: 500, // Bus: 30 kg
        trainKm: 1000, // Train: 40 kg
        shortFlightKm: 200, // Short: 50 kg
        longFlightKm: 2000, // Long: 360 kg
      };
      // Total kg = 220 + 30 + 40 + 50 + 360 = 700 kg = 0.7 tonnes
      expect(calculateTransportEmissions(inputs)).toBe(0.7);
    });
  });

  describe('Housing Emissions', () => {
    it('should return 0 when all inputs are 0 or empty', () => {
      expect(calculateHousingEmissions()).toBe(0);
    });

    it('should multiply monthly usage by 12 for annual totals', () => {
      const inputs = {
        electricityKwh: 100, // 38 kg/mo = 456 kg/yr
        gasTherms: 10,       // 53 kg/mo = 636 kg/yr
        waterLitres: 10000,   // 3 kg/mo = 36 kg/yr
      };
      // Total annual kg = 456 + 636 + 36 = 1128 kg = 1.128 tonnes
      expect(calculateHousingEmissions(inputs)).toBe(1.128);
    });
  });

  describe('Food Emissions', () => {
    it('should correctly compute vegan diet emissions', () => {
      const expected = (EMISSION_FACTORS.diet.vegan * 365) / 1000;
      expect(calculateFoodEmissions({ dietType: 'vegan' })).toBe(expected);
    });

    it('should fall back to lowMeat diet if unknown type is given', () => {
      const expected = (EMISSION_FACTORS.diet.lowMeat * 365) / 1000;
      expect(calculateFoodEmissions({ dietType: 'unknown' })).toBe(expected);
    });
  });

  describe('Waste Emissions', () => {
    it('should handle zero waste correctly', () => {
      expect(calculateWasteEmissions()).toBe(0);
    });

    it('should apply recycling rate to offset landfill emissions', () => {
      const inputs = {
        wasteKg: 10,        // 10 kg/week
        recyclingRate: 50,  // 50% recycled = 5 kg landfilled
      };
      // Annual landfilled = 5 * 52 = 260 kg
      // CO2 = 260 * 0.5 = 130 kg = 0.13 tonnes
      expect(calculateWasteEmissions(inputs)).toBe(0.13);
    });

    it('should clamp recycling rates between 0 and 100', () => {
      expect(calculateWasteEmissions({ wasteKg: 10, recyclingRate: 150 })).toBe(0); // 100% recycling
      expect(calculateWasteEmissions({ wasteKg: 10, recyclingRate: -50 })).toBe(0.26); // 0% recycling
    });
  });

  describe('Total Footprint Aggregation', () => {
    it('should aggregate all components and apply rounding', () => {
      const profile = {
        transport: { drivingKm: 10000, vehicleType: 'gasolineVehicle' }, // 2.2 tonnes
        housing: { electricityKwh: 100, gasTherms: 10, waterLitres: 10000 }, // 1.128 tonnes
        food: { dietType: 'vegan' }, // 0.9855 tonnes
        waste: { wasteKg: 10, recyclingRate: 50 }, // 0.13 tonnes
      };
      // Sum = 2.2 + 1.128 + 0.9855 + 0.13 = 4.4435 tonnes -> rounds to 4.444
      const result = calculateTotalFootprint(profile);
      expect(result.total).toBe(4.444);
      expect(result.breakdown.transport).toBe(2.2);
      expect(result.breakdown.housing).toBe(1.128);
      expect(result.breakdown.food).toBe(0.986); // rounds to 3 decimals
      expect(result.breakdown.waste).toBe(0.13);
    });
  });

  describe('Equivalencies', () => {
    it('should calculate accurate metrics for positive CO2 values', () => {
      const result = calculateEquivalencies(2.2); // 2200 kg CO2
      expect(result.treesPlanted).toBe(100); // 2200 / 22
      expect(result.smartphonesCharged).toBe(265060); // 2200 / 0.0083
    });
  });
});
