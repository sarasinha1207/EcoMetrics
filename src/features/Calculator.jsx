import React, { useState } from 'react';
import Card from '../components/Card';
import { EMISSION_FACTORS } from '../utils/calculations';

// Icons inside calculator tabs
const CalcIcons = {
  transit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v6c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="15" cy="17" r="2" />
    </svg>
  ),
  energy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  food: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  shopping: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  waste: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
};

export default function Calculator({ initialInputs, onSave }) {
  const [activeTab, setActiveTab] = useState('transit');

  // Input states (rebuilt to track weekly values)
  const [transit, setTransit] = useState(initialInputs?.transport ? {
    carPetrolKm: Math.round((initialInputs.transport.drivingKm * 0.8) / 52), // Assume 80% is petrol
    carElectricKm: Math.round((initialInputs.transport.drivingKm * 0.2) / 52), // 20% electric
    busKm: Math.round(initialInputs.transport.publicTransitKm / 52),
    trainKm: Math.round(initialInputs.transport.trainKm / 52),
    shortFlightAnnual: initialInputs.transport.shortFlightKm || 0,
    longFlightAnnual: initialInputs.transport.longFlightKm || 2000,
    seatingClass: 'economy'
  } : {
    carPetrolKm: 120,
    carElectricKm: 30,
    busKm: 20,
    trainKm: 10,
    shortFlightAnnual: 1000,
    longFlightAnnual: 4000,
    seatingClass: 'economy'
  });

  const [energy, setEnergy] = useState(initialInputs?.housing ? {
    electricityKwh: initialInputs.housing.electricityKwh || 350,
    gasTherms: initialInputs.housing.gasTherms || 30,
    waterLitres: initialInputs.housing.waterLitres || 6000
  } : {
    electricityKwh: 350,
    gasTherms: 30,
    waterLitres: 6000
  });

  const [food, setFood] = useState(initialInputs?.food || {
    dietType: 'lowMeat'
  });

  const [shopping, setShopping] = useState({
    clothingSpend: 50,
    electronicsSpend: 100
  });

  const [waste, setWaste] = useState(initialInputs?.waste || {
    wasteKg: 8,
    recyclingRate: 30
  });

  const [logNotes, setLogNotes] = useState('');

  // Weekly Emissions Calculations (represented in kg CO2e)
  // 1. Transit
  const carPetrolCo2 = transit.carPetrolKm * EMISSION_FACTORS.transport.gasolineVehicle;
  const carElectricCo2 = transit.carElectricKm * EMISSION_FACTORS.transport.electricVehicle;
  const busCo2 = transit.busKm * EMISSION_FACTORS.transport.publicTransitBus;
  const trainCo2 = transit.trainKm * EMISSION_FACTORS.transport.train;
  const shortFlightCo2 = (transit.shortFlightAnnual * EMISSION_FACTORS.transport.shortFlight) / 52;
  const longFlightCo2 = (transit.longFlightAnnual * EMISSION_FACTORS.transport.longFlight) / 52;
  
  // Apply multipliers for flight seating classes (Business/First class take up more space/emissions)
  const classMultiplier = transit.seatingClass === 'business' ? 1.5 : transit.seatingClass === 'first' ? 2.5 : 1.0;
  const totalTransitCo2 = (carPetrolCo2 + carElectricCo2 + busCo2 + trainCo2 + shortFlightCo2 + longFlightCo2) * classMultiplier;

  // 2. Energy (converting monthly values to weekly)
  const elecCo2 = (energy.electricityKwh * EMISSION_FACTORS.housing.electricityKwh) / 4.33;
  const gasCo2 = (energy.gasTherms * EMISSION_FACTORS.housing.naturalGasTherm) / 4.33;
  const waterCo2 = (energy.waterLitres * EMISSION_FACTORS.housing.waterLitre) / 4.33;
  const totalEnergyCo2 = elecCo2 + gasCo2 + waterCo2;

  // 3. Food (daily values multiplied by 7)
  const foodDailyFactor = EMISSION_FACTORS.diet[food.dietType] || EMISSION_FACTORS.diet.lowMeat;
  const totalFoodCo2 = foodDailyFactor * 7;

  // 4. Shopping
  const totalShoppingCo2 = (shopping.clothingSpend * 0.4 + shopping.electronicsSpend * 0.8) / 4.33;

  // 5. Waste
  const totalWasteCo2 = waste.wasteKg * EMISSION_FACTORS.waste.landfill * (1 - waste.recyclingRate / 100);

  // Total weekly sum
  const runningTotalCo2 = parseFloat((totalTransitCo2 + totalEnergyCo2 + totalFoodCo2 + totalShoppingCo2 + totalWasteCo2).toFixed(1));

  // Save changes callback mapping back to annual totals (expected by App.jsx backend schema)
  const handleLogEntry = () => {
    // Map weekly values back to annual approximations for db save
    const profileData = {
      transport: {
        drivingKm: Math.round((Number(transit.carPetrolKm) + Number(transit.carElectricKm)) * 52),
        vehicleType: Number(transit.carElectricKm) > Number(transit.carPetrolKm) ? 'electricVehicle' : 'gasolineVehicle',
        publicTransitKm: Math.round(Number(transit.busKm) * 52),
        trainKm: Math.round(Number(transit.trainKm) * 52),
        shortFlightKm: Number(transit.shortFlightAnnual),
        longFlightKm: Number(transit.longFlightAnnual)
      },
      housing: {
        electricityKwh: Number(energy.electricityKwh),
        gasTherms: Number(energy.gasTherms),
        waterLitres: Number(energy.waterLitres)
      },
      food: {
        dietType: food.dietType
      },
      waste: {
        wasteKg: Number(waste.wasteKg),
        recyclingRate: Number(waste.recyclingRate)
      }
    };
    onSave(profileData);
  };

  // Render weekly benchmark progress widths (Clamped max value 120kg)
  const benchmarkMax = 120;
  const currentTotalPercent = Math.min(100, (runningTotalCo2 / benchmarkMax) * 100);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
      
      {/* Main Two Column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="col-span-2">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              
              {/* Dual-pane calculator card layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', lgDirection: 'row', gap: '1.5rem' }}>
                  
                  {/* Left Form Input Card */}
                  <Card className="soft-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Tab Navigation header */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-soft)', paddingBottom: '0.75rem', gap: '0.25rem', overflowX: 'auto' }}>
                      {[
                        { key: 'transit', label: 'Transit', icon: CalcIcons.transit },
                        { key: 'energy', label: 'Energy', icon: CalcIcons.energy },
                        { key: 'food', label: 'Food', icon: CalcIcons.food },
                        { key: 'shopping', label: 'Shopping', icon: CalcIcons.shopping },
                        { key: 'waste', label: 'Waste', icon: CalcIcons.waste }
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          style={{
                            border: 'none',
                            background: activeTab === tab.key ? 'var(--accent-soft-green)' : 'none',
                            color: activeTab === tab.key ? 'var(--accent-dark-green)' : 'var(--text-muted)',
                            fontWeight: 600,
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {tab.icon()}
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Tab Body panel */}
                    <div style={{ flex: 1 }}>
                      
                      {/* Transit Tab */}
                      {activeTab === 'transit' && (
                        <div>
                          <h3 style={{ fontSize: '1rem', color: 'var(--accent-dark-green)', marginBottom: '0.5rem' }}>Transportation Calculator</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Enter details about your weekly commutes and flights taken</p>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="form-group">
                              <label htmlFor="petrol-km">Car Distance (Petrol/Diesel km/week)</label>
                              <input 
                                type="number" id="petrol-km" className="form-control" 
                                value={transit.carPetrolKm} 
                                onChange={(e) => setTransit(prev => ({ ...prev, carPetrolKm: Number(e.target.value) }))}
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="elec-km">Car Distance (Electric km/week)</label>
                              <input 
                                type="number" id="elec-km" className="form-control" 
                                value={transit.carElectricKm} 
                                onChange={(e) => setTransit(prev => ({ ...prev, carElectricKm: Number(e.target.value) }))}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="form-group">
                              <label htmlFor="bus-km">Bus Travel (km/week)</label>
                              <input 
                                type="number" id="bus-km" className="form-control" 
                                value={transit.busKm} 
                                onChange={(e) => setTransit(prev => ({ ...prev, busKm: Number(e.target.value) }))}
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="train-km">Train / Metro (km/week)</label>
                              <input 
                                type="number" id="train-km" className="form-control" 
                                value={transit.trainKm} 
                                onChange={(e) => setTransit(prev => ({ ...prev, trainKm: Number(e.target.value) }))}
                              />
                            </div>
                          </div>

                          <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', margin: '1rem 0 0.5rem 0' }}>Flight Distances (Annual)</span>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="form-group">
                              <label htmlFor="short-flights">Short-Haul Flights (&lt; 3hrs total km)</label>
                              <input 
                                type="number" id="short-flights" className="form-control" 
                                value={transit.shortFlightAnnual} 
                                onChange={(e) => setTransit(prev => ({ ...prev, shortFlightAnnual: Number(e.target.value) }))}
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="long-flights">Long-Haul Flights (&gt; 6hrs total km)</label>
                              <input 
                                type="number" id="long-flights" className="form-control" 
                                value={transit.longFlightAnnual} 
                                onChange={(e) => setTransit(prev => ({ ...prev, longFlightAnnual: Number(e.target.value) }))}
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label htmlFor="seating-select">Travel Seating Class</label>
                            <select
                              id="seating-select"
                              className="form-control"
                              value={transit.seatingClass}
                              onChange={(e) => setTransit(prev => ({ ...prev, seatingClass: e.target.value }))}
                            >
                              <option value="economy">Economy Class</option>
                              <option value="business">Business Class</option>
                              <option value="first">First Class</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Energy Tab */}
                      {activeTab === 'energy' && (
                        <div>
                          <h3 style={{ fontSize: '1rem', color: 'var(--accent-dark-green)', marginBottom: '0.5rem' }}>Home Energy Calculator</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Provide electricity, heating, and water utility inputs</p>
                          
                          <div className="form-group">
                            <label htmlFor="electricity-kwh">Electricity Usage (kWh/month)</label>
                            <input 
                              type="number" id="electricity-kwh" className="form-control"
                              value={energy.electricityKwh}
                              onChange={(e) => setEnergy(prev => ({ ...prev, electricityKwh: Number(e.target.value) }))}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label htmlFor="gas-therms">Natural Gas (therms/month)</label>
                            <input 
                              type="number" id="gas-therms" className="form-control"
                              value={energy.gasTherms}
                              onChange={(e) => setEnergy(prev => ({ ...prev, gasTherms: Number(e.target.value) }))}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="water-litres">Water Consumption (litres/month)</label>
                            <input 
                              type="number" id="water-litres" className="form-control"
                              value={energy.waterLitres}
                              onChange={(e) => setEnergy(prev => ({ ...prev, waterLitres: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                      )}

                      {/* Food Tab */}
                      {activeTab === 'food' && (
                        <div>
                          <h3 style={{ fontSize: '1rem', color: 'var(--accent-dark-green)', marginBottom: '0.5rem' }}>Dietary Habits</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Select the diet profile that best represents your eating habits</p>
                          
                          <div className="form-group">
                            <label htmlFor="diet-select">Diet Type</label>
                            <select
                              id="diet-select"
                              className="form-control"
                              value={food.dietType}
                              onChange={(e) => setFood(prev => ({ ...prev, dietType: e.target.value }))}
                              style={{ height: 'auto', padding: '0.75rem' }}
                            >
                              <option value="highMeat">High Meat (Heavy beef/lamb consumer)</option>
                              <option value="lowMeat">Low Meat / Flexitarian (Poultry/fish focus)</option>
                              <option value="vegetarian">Vegetarian (No meat/fish)</option>
                              <option value="vegan">Vegan (Strict plant-based)</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Shopping Tab */}
                      {activeTab === 'shopping' && (
                        <div>
                          <h3 style={{ fontSize: '1rem', color: 'var(--accent-dark-green)', marginBottom: '0.5rem' }}>Shopping & Consumption</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Enter average monthly expenditure on commercial goods</p>
                          
                          <div className="form-group">
                            <label htmlFor="clothing-spend">Clothing Purchases ($/month)</label>
                            <input 
                              type="number" id="clothing-spend" className="form-control"
                              value={shopping.clothingSpend}
                              onChange={(e) => setShopping(prev => ({ ...prev, clothingSpend: Number(e.target.value) }))}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="electronics-spend">Electronics & Devices ($/month)</label>
                            <input 
                              type="number" id="electronics-spend" className="form-control"
                              value={shopping.electronicsSpend}
                              onChange={(e) => setShopping(prev => ({ ...prev, electronicsSpend: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                      )}

                      {/* Waste Tab */}
                      {activeTab === 'waste' && (
                        <div>
                          <h3 style={{ fontSize: '1rem', color: 'var(--accent-dark-green)', marginBottom: '0.5rem' }}>Waste & Recycling</h3>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Enter household refuse volumes and recycling patterns</p>
                          
                          <div className="form-group">
                            <label htmlFor="waste-mass">Garbage Generated (kg/week)</label>
                            <input 
                              type="number" id="waste-mass" className="form-control"
                              value={waste.wasteKg}
                              onChange={(e) => setWaste(prev => ({ ...prev, wasteKg: Number(e.target.value) }))}
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="recycling-rate">Recycling Divert Rate (%)</label>
                            <input 
                              type="number" id="recycling-rate" className="form-control"
                              value={waste.recyclingRate}
                              onChange={(e) => setWaste(prev => ({ ...prev, recyclingRate: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                      )}

                    </div>
                  </Card>

                  {/* Right Navy Widget Panel */}
                  <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                    <Card style={{ 
                      backgroundColor: '#0a1d2d', 
                      color: '#ffffff', 
                      borderRadius: '16px', 
                      padding: '1.5rem', 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 10px 30px rgba(10, 29, 45, 0.15)'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a0aec0', letterSpacing: '0.05em' }}>RUNNING TOTAL</span>
                        <p style={{ fontSize: '2rem', fontWeight: 700, margin: '0.25rem 0', color: '#ffffff' }}>
                          {runningTotalCo2} <span style={{ fontSize: '1rem', color: '#a0aec0', fontWeight: 500 }}>kg CO2e</span>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginBottom: '1.5rem' }}>
                          Sum of all categories currently calculated in real-time
                        </p>

                        {/* Category breakdowns */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a0aec0', letterSpacing: '0.05em' }}>LIVE CATEGORY BREAKDOWN</span>
                          
                          {/* Transit progress */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.2rem' }}>
                              <span>Transit</span>
                              <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalTransitCo2.toFixed(1)} kg</span>
                            </div>
                            <div className="category-progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                              <div className="category-progress-fill" style={{ width: `${Math.min(100, (totalTransitCo2 / Math.max(1, runningTotalCo2)) * 100)}%`, backgroundColor: 'var(--accent-teal)' }} />
                            </div>
                          </div>

                          {/* Energy progress */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.2rem' }}>
                              <span>Energy</span>
                              <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalEnergyCo2.toFixed(1)} kg</span>
                            </div>
                            <div className="category-progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                              <div className="category-progress-fill" style={{ width: `${Math.min(100, (totalEnergyCo2 / Math.max(1, runningTotalCo2)) * 100)}%`, backgroundColor: 'var(--accent-sky)' }} />
                            </div>
                          </div>

                          {/* Food progress */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.2rem' }}>
                              <span>Food</span>
                              <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalFoodCo2.toFixed(1)} kg</span>
                            </div>
                            <div className="category-progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                              <div className="category-progress-fill" style={{ width: `${Math.min(100, (totalFoodCo2 / Math.max(1, runningTotalCo2)) * 100)}%`, backgroundColor: 'var(--accent-emerald)' }} />
                            </div>
                          </div>

                          {/* Shopping progress */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.2rem' }}>
                              <span>Shopping</span>
                              <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalShoppingCo2.toFixed(1)} kg</span>
                            </div>
                            <div className="category-progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                              <div className="category-progress-fill" style={{ width: `${Math.min(100, (totalShoppingCo2 / Math.max(1, runningTotalCo2)) * 100)}%`, backgroundColor: 'var(--accent-sky)' }} />
                            </div>
                          </div>

                          {/* Waste progress */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a0aec0', marginBottom: '0.2rem' }}>
                              <span>Waste</span>
                              <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalWasteCo2.toFixed(1)} kg</span>
                            </div>
                            <div className="category-progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                              <div className="category-progress-fill" style={{ width: `${Math.min(100, (totalWasteCo2 / Math.max(1, runningTotalCo2)) * 100)}%`, backgroundColor: 'var(--text-light)' }} />
                            </div>
                          </div>

                        </div>

                        {/* Benchmark Bar */}
                        <div style={{ marginBottom: '1.5rem' }}>
                          <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#a0aec0', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                            WEEKLY BENCHMARK COMPARISON
                          </span>
                          <div className="category-progress" style={{ height: '12px', backgroundColor: 'rgba(255,255,255,0.08)', position: 'relative' }}>
                            <div 
                              className="category-progress-fill" 
                              style={{ 
                                width: `${currentTotalPercent}%`, 
                                backgroundColor: runningTotalCo2 > 90 ? 'var(--accent-danger)' : runningTotalCo2 > 32 ? 'var(--accent-orange)' : 'var(--accent-emerald)' 
                              }} 
                            />
                            {/* Target markers */}
                            <div style={{ position: 'absolute', left: '26%', top: 0, bottom: 0, width: '2px', backgroundColor: '#ffffff', opacity: 0.8 }} title="Safe Target (32kg)" />
                            <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '2px', backgroundColor: '#ffffff', opacity: 0.8 }} title="World Average (90kg)" />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#a0aec0', marginTop: '0.25rem', fontWeight: 600 }}>
                            <span style={{ color: 'var(--accent-emerald)' }}>Safe Target: ~32 kg</span>
                            <span style={{ color: 'var(--accent-danger)' }}>World Avg: ~90 kg</span>
                          </div>
                        </div>

                      </div>

                      <button 
                        onClick={handleLogEntry}
                        className="btn btn-primary"
                        style={{ 
                          width: '100%', 
                          backgroundColor: 'var(--accent-primary)', 
                          color: '#ffffff',
                          padding: '0.85rem'
                        }}
                      >
                        Log {activeTab.toUpperCase()} Entry
                      </button>
                    </Card>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Optional Notes */}
      <Card className="soft-card">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="log-notes">Log Notes (Optional)</label>
          <textarea 
            id="log-notes" 
            className="form-control" 
            rows="2" 
            placeholder="e.g. Weekly commute breakdown or specific item purchases"
            value={logNotes}
            onChange={(e) => setLogNotes(e.target.value)}
          />
        </div>
      </Card>

    </div>
  );
}
