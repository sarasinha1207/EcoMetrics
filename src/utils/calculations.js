// Carbon Footprint Emission Factors and Mathematical Formulas
// Citing standard IPCC and EPA GHG Emission Factors Hub methodologies.

export const EMISSION_FACTORS = {
  // Transportation (kg CO2e per kilometer)
  transport: {
    gasolineVehicle: 0.22, // Average passenger car
    dieselVehicle: 0.25,
    hybridVehicle: 0.11,
    electricVehicle: 0.05, // Accounts for power grid emissions
    publicTransitBus: 0.06,
    train: 0.04,
    shortFlight: 0.25, // Under 500 km (higher take-off cost per km)
    longFlight: 0.18,  // Over 500 km
  },
  
  // Home Energy (kg CO2e per unit)
  housing: {
    electricityKwh: 0.38,  // Average grid electricity mix
    naturalGasTherm: 5.3,  // Per therm (100,000 BTU)
    naturalGasM3: 2.0,     // Per cubic meter
    waterLitre: 0.0003,    // Grid treatment & supply
  },
  
  // Food & Diet (kg CO2e per person per day)
  diet: {
    highMeat: 8.5,        // Daily heavy beef/lamb consumer
    lowMeat: 4.7,         // Flexitarian / poultry consumer
    vegetarian: 3.8,      // Eggs/dairy included
    vegan: 2.7,           // Zero animal product dietary footprint
  },
  
  // Waste (kg CO2e per kg of waste)
  waste: {
    landfill: 0.5,        // Direct landfill degradation
  }
};

/**
 * Calculates transportation carbon emissions.
 * @param {Object} inputs - Transport activity details
 * @param {number} inputs.drivingKm - Annual driving distance in km
 * @param {string} inputs.vehicleType - Type of vehicle (gasolineVehicle, hybridVehicle, electricVehicle, etc.)
 * @param {number} inputs.publicTransitKm - Annual public transit distance in km
 * @param {number} inputs.trainKm - Annual train distance in km
 * @param {number} inputs.shortFlightKm - Annual short flight distance in km
 * @param {number} inputs.longFlightKm - Annual long flight distance in km
 * @returns {number} Transport carbon footprint in metric tonnes CO2e
 */
export function calculateTransportEmissions({
  drivingKm = 0,
  vehicleType = 'gasolineVehicle',
  publicTransitKm = 0,
  trainKm = 0,
  shortFlightKm = 0,
  longFlightKm = 0,
} = {}) {
  const vehicleFactor = EMISSION_FACTORS.transport[vehicleType] || EMISSION_FACTORS.transport.gasolineVehicle;
  
  const drivingCO2 = (Number(drivingKm) || 0) * vehicleFactor;
  const transitCO2 = (Number(publicTransitKm) || 0) * EMISSION_FACTORS.transport.publicTransitBus;
  const trainCO2 = (Number(trainKm) || 0) * EMISSION_FACTORS.transport.train;
  const shortFlightCO2 = (Number(shortFlightKm) || 0) * EMISSION_FACTORS.transport.shortFlight;
  const longFlightCO2 = (Number(longFlightKm) || 0) * EMISSION_FACTORS.transport.longFlight;
  
  const totalKg = drivingCO2 + transitCO2 + trainCO2 + shortFlightCO2 + longFlightCO2;
  return totalKg / 1000; // Convert to metric tonnes
}

/**
 * Calculates housing carbon emissions.
 * @param {Object} inputs - Home energy activity details
 * @param {number} inputs.electricityKwh - Monthly electricity usage in kWh
 * @param {number} inputs.gasTherms - Monthly natural gas usage in therms
 * @param {number} inputs.waterLitres - Monthly water usage in litres
 * @returns {number} Housing carbon footprint in metric tonnes CO2e per year
 */
export function calculateHousingEmissions({
  electricityKwh = 0,
  gasTherms = 0,
  waterLitres = 0,
} = {}) {
  const monthlyElectricityCO2 = (Number(electricityKwh) || 0) * EMISSION_FACTORS.housing.electricityKwh;
  const monthlyGasCO2 = (Number(gasTherms) || 0) * EMISSION_FACTORS.housing.naturalGasTherm;
  const monthlyWaterCO2 = (Number(waterLitres) || 0) * EMISSION_FACTORS.housing.waterLitre;
  
  const monthlyTotalKg = monthlyElectricityCO2 + monthlyGasCO2 + monthlyWaterCO2;
  const annualTotalKg = monthlyTotalKg * 12;
  return annualTotalKg / 1000; // Convert to metric tonnes
}

/**
 * Calculates food carbon emissions.
 * @param {Object} inputs - Dietary habit details
 * @param {string} inputs.dietType - Diet profile (highMeat, lowMeat, vegetarian, vegan)
 * @returns {number} Food carbon footprint in metric tonnes CO2e per year
 */
export function calculateFoodEmissions({
  dietType = 'lowMeat',
} = {}) {
  const dailyFactor = EMISSION_FACTORS.diet[dietType] || EMISSION_FACTORS.diet.lowMeat;
  const annualKg = dailyFactor * 365;
  return annualKg / 1000; // Convert to metric tonnes
}

/**
 * Calculates waste carbon emissions.
 * @param {Object} inputs - Household waste details
 * @param {number} inputs.wasteKg - Weekly waste output in kg
 * @param {number} inputs.recyclingRate - Percent of waste recycled (0-100)
 * @returns {number} Waste carbon footprint in metric tonnes CO2e per year
 */
export function calculateWasteEmissions({
  wasteKg = 0,
  recyclingRate = 0,
} = {}) {
  const rate = Math.min(Math.max(Number(recyclingRate) || 0, 0), 100);
  const weeklyWaste = Number(wasteKg) || 0;
  
  // Recycled waste avoids landfill degradation emissions
  const landfilledWasteKg = weeklyWaste * (1 - rate / 100);
  const weeklyKg = landfilledWasteKg * EMISSION_FACTORS.waste.landfill;
  const annualKg = weeklyKg * 52;
  
  return annualKg / 1000; // Convert to metric tonnes
}

/**
 * Aggregates all emission sources.
 * @param {Object} inputs - Combined calculator entries
 * @returns {Object} Total and subcategory emissions in metric tonnes CO2e per year
 */
export function calculateTotalFootprint(inputs = {}) {
  const transport = calculateTransportEmissions(inputs.transport);
  const housing = calculateHousingEmissions(inputs.housing);
  const food = calculateFoodEmissions(inputs.food);
  const waste = calculateWasteEmissions(inputs.waste);
  
  const total = transport + housing + food + waste;
  
  return {
    total: parseFloat(total.toFixed(3)),
    breakdown: {
      transport: parseFloat(transport.toFixed(3)),
      housing: parseFloat(housing.toFixed(3)),
      food: parseFloat(food.toFixed(3)),
      waste: parseFloat(waste.toFixed(3)),
    }
  };
}

/**
 * Calculates environmental equivalencies from tonnes of CO2.
 * @param {number} tonnesCO2 - Annual footprint in metric tonnes
 * @returns {Object} Metric equivalents
 */
export function calculateEquivalencies(tonnesCO2) {
  const val = Number(tonnesCO2) || 0;
  return {
    // 1 tree absorbs approx 22 kg CO2 per year
    treesPlanted: Math.round((val * 1000) / 22),
    // Average gasoline car emits 0.22 kg CO2 per km, i.e. 220 kg per 1000 km
    milesDrivenGasCar: Math.round((val * 1000) / 0.35), // Approx 0.35 kg/mile
    // 1 smartphone charge is approx 0.008 kg CO2
    smartphonesCharged: Math.round((val * 1000) / 0.0083),
  };
}
