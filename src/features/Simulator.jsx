import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Slider from '../components/Slider';
import { EMISSION_FACTORS } from '../utils/calculations';

// Cost approximations for financial calculations
const CONSTANTS = {
  pricePerKmGasoline: 0.15, // Cost per km driven (fuel + maintenance)
  pricePerKwhElectricity: 0.16, // $0.16 per kWh
  pricePerThermGas: 1.50, // $1.50 per therm of gas
};

export default function Simulator({ currentCalc }) {
  // Safe extraction of current baseline values
  const transportInputs = currentCalc?.inputs?.transport || { drivingKm: 8000, vehicleType: 'gasolineVehicle' };
  const housingInputs = currentCalc?.inputs?.housing || { electricityKwh: 350, gasTherms: 30, waterLitres: 6000 };
  const foodInputs = currentCalc?.inputs?.food || { dietType: 'lowMeat' };

  // Slider simulator states (reductions)
  const [reduceDriving, setReduceDriving] = useState(0);
  const [reduceElectricity, setReduceElectricity] = useState(0);
  const [reduceGas, setReduceGas] = useState(0);
  const [dietShift, setDietShift] = useState(foodInputs.dietType);

  // Sync simulator limits when baseline calculations change
  useEffect(() => {
    setReduceDriving(0);
    setReduceElectricity(0);
    setReduceGas(0);
    setDietShift(foodInputs.dietType);
  }, [currentCalc, foodInputs.dietType]);

  // Compute live calculations
  const baselineTransportCO2 = currentCalc?.breakdown?.transport || 0;
  const baselineHousingCO2 = currentCalc?.breakdown?.housing || 0;
  const baselineFoodCO2 = currentCalc?.breakdown?.food || 0;
  const baselineTotalCO2 = currentCalc?.total || 0;

  // 1. Driving reduction impact
  const vehicleFactor = EMISSION_FACTORS.transport[transportInputs.vehicleType] || EMISSION_FACTORS.transport.gasolineVehicle;
  const co2SavedDriving = (reduceDriving * vehicleFactor) / 1000; // tonnes
  const costSavedDriving = reduceDriving * CONSTANTS.pricePerKmGasoline;

  // 2. Electricity reduction impact
  const co2SavedElectricity = (reduceElectricity * EMISSION_FACTORS.housing.electricityKwh * 12) / 1000; // tonnes/year
  const costSavedElectricity = reduceElectricity * CONSTANTS.pricePerKwhElectricity * 12;

  // 3. Gas reduction impact
  const co2SavedGas = (reduceGas * EMISSION_FACTORS.housing.naturalGasTherm * 12) / 1000; // tonnes/year
  const costSavedGas = reduceGas * CONSTANTS.pricePerThermGas * 12;

  // 4. Diet shift impact
  const baselineDietDaily = EMISSION_FACTORS.diet[foodInputs.dietType] || EMISSION_FACTORS.diet.lowMeat;
  const newDietDaily = EMISSION_FACTORS.diet[dietShift] || EMISSION_FACTORS.diet.lowMeat;
  const co2SavedDiet = Math.max(0, ((baselineDietDaily - newDietDaily) * 365) / 1000); // tonnes/year

  // Totals
  const totalCo2Saved = parseFloat((co2SavedDriving + co2SavedElectricity + co2SavedGas + co2SavedDiet).toFixed(3));
  const totalCostSaved = Math.round(costSavedDriving + costSavedElectricity + costSavedGas);
  
  const simulatedTotalCO2 = Math.max(0, parseFloat((baselineTotalCO2 - totalCo2Saved).toFixed(3)));

  // Calculate environmental score (1-100 scale, where < 2.0 tonnes is 100, and 18+ tonnes is 1)
  const calculateScore = (emissions) => {
    if (emissions <= 2.0) return 100;
    if (emissions >= 18.0) return 1;
    // Linear scale between 2.0 and 18.0 tonnes
    return Math.round(100 - ((emissions - 2.0) / 16.0) * 99);
  };

  const baselineScore = calculateScore(baselineTotalCO2);
  const simulatedScore = calculateScore(simulatedTotalCO2);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* KPI: Simulated Total Footprint */}
        <Card style={{ textAlign: 'center', borderLeft: '4px solid var(--accent-teal)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Projected Emissions</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
            {simulatedTotalCO2} <span style={{ fontSize: '1rem', fontWeight: 500 }}>t/yr</span>
          </p>
          <span style={{ fontSize: '0.75rem', color: totalCo2Saved > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
            {totalCo2Saved > 0 ? `-${totalCo2Saved} tonnes reduced` : 'No simulation changes'}
          </span>
        </Card>

        {/* KPI: Financial Savings */}
        <Card style={{ textAlign: 'center', borderLeft: '4px solid var(--accent-emerald)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Annual Financial Savings</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-emerald)', margin: '0.25rem 0' }}>
            ${totalCostSaved.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 500 }}>/ yr</span>
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Based on average resource costs
          </span>
        </Card>

        {/* KPI: Sustainability Score */}
        <Card style={{ textAlign: 'center', borderLeft: '4px solid var(--accent-sky)' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>EcoScore Rating</span>
          <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-sky)', margin: '0.25rem 0' }}>
            {simulatedScore} <span style={{ fontSize: '1rem', fontWeight: 500 }}>/ 100</span>
          </p>
          <span style={{ fontSize: '0.75rem', color: simulatedScore > baselineScore ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
            {simulatedScore > baselineScore ? `+${simulatedScore - baselineScore} rating points` : 'Baseline rating'}
          </span>
        </Card>
      </div>

      <Card tag="article" ariaLabel="Adjustment inputs for carbon reduction simulation">
        <h3 style={{ marginBottom: '1.5rem' }}>Adjust Your Habits</h3>

        {/* Transport adjustment */}
        <Slider
          id="sim-drive"
          label="Reduce Driving Distance (km/year)"
          min={0}
          max={transportInputs.drivingKm}
          step={Math.max(100, Math.round(transportInputs.drivingKm / 20))}
          value={reduceDriving}
          onChange={setReduceDriving}
          valueDisplay={(val) => `-${val.toLocaleString()} km`}
        />

        {/* Electricity adjustment */}
        <Slider
          id="sim-elec"
          label="Reduce Electricity Usage (kWh/month)"
          min={0}
          max={housingInputs.electricityKwh}
          step={Math.max(10, Math.round(housingInputs.electricityKwh / 20))}
          value={reduceElectricity}
          onChange={setReduceElectricity}
          valueDisplay={(val) => `-${val} kWh`}
        />

        {/* Gas adjustment */}
        <Slider
          id="sim-gas"
          label="Reduce Natural Gas Usage (therms/month)"
          min={0}
          max={housingInputs.gasTherms}
          step={Math.max(1, Math.round(housingInputs.gasTherms / 15))}
          value={reduceGas}
          onChange={setReduceGas}
          valueDisplay={(val) => `-${val} therms`}
        />

        {/* Diet shift adjustment */}
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label htmlFor="sim-diet">Simulated Diet Shift</label>
          <select
            id="sim-diet"
            className="form-control"
            value={dietShift}
            onChange={(e) => setDietShift(e.target.value)}
          >
            {/* Show dietary options only equal to or lower footprint than baseline */}
            <option value="highMeat" disabled={foodInputs.dietType !== 'highMeat'}>
              High Meat Diet (8.5 kg CO2e/day)
            </option>
            <option value="lowMeat" disabled={foodInputs.dietType === 'vegetarian' || foodInputs.dietType === 'vegan'}>
              Low Meat / Flexitarian (4.7 kg CO2e/day)
            </option>
            <option value="vegetarian" disabled={foodInputs.dietType === 'vegan'}>
              Vegetarian Diet (3.8 kg CO2e/day)
            </option>
            <option value="vegan">
              Vegan Diet (2.7 kg CO2e/day)
            </option>
          </select>
        </div>
      </Card>
    </div>
  );
}
