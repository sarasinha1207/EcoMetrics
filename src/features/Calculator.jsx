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

  const [shopping, setShopping] = useState(initialInputs?.shopping || {
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
  
  // Apply class multiplier ONLY to flight emissions — car/bus/train unaffected by seating class
  const classMultiplier = transit.seatingClass === 'business' ? 1.5 : transit.seatingClass === 'first' ? 2.5 : 1.0;
  const adjustedFlightCo2 = (shortFlightCo2 + longFlightCo2) * classMultiplier;
  const totalTransitCo2 = carPetrolCo2 + carElectricCo2 + busCo2 + trainCo2 + adjustedFlightCo2;

  // 2. Energy (converting monthly values to weekly)
  const elecCo2 = (energy.electricityKwh * EMISSION_FACTORS.housing.electricityKwh) / 4.33;
  const gasCo2 = (energy.gasTherms * EMISSION_FACTORS.housing.naturalGasTherm) / 4.33;
  const waterCo2 = (energy.waterLitres * EMISSION_FACTORS.housing.waterLitre) / 4.33;
  const totalEnergyCo2 = elecCo2 + gasCo2 + waterCo2;

  // 3. Food (daily values multiplied by 7)
  const foodDailyFactor = EMISSION_FACTORS.diet[food.dietType] || EMISSION_FACTORS.diet.lowMeat;
  const totalFoodCo2 = foodDailyFactor * 7;

  // 4. Shopping
  const clothingCo2 = (shopping.clothingSpend * EMISSION_FACTORS.shopping.clothingSpend) / 4.33;
  const electronicsCo2 = (shopping.electronicsSpend * EMISSION_FACTORS.shopping.electronicsSpend) / 4.33;
  const totalShoppingCo2 = clothingCo2 + electronicsCo2;

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
      shopping: {
        clothingSpend: Number(shopping.clothingSpend),
        electronicsSpend: Number(shopping.electronicsSpend)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Main Responsive Grid Layout */}
      <div className="calculator-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', lgDirection: 'row', gap: '1.5rem', flexWrap: 'wrap' }} className="calculator-layout">
          
          {/* Left Form Input Card */}
          <Card className="soft-card calculator-form" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.75rem', padding: '2rem' }}>
            
            {/* Tab Navigation header formatted as a premium segmented controller */}
            <div style={{ 
              display: 'flex', 
              backgroundColor: 'var(--bg-secondary)', 
              padding: '0.35rem', 
              borderRadius: '16px', 
              gap: '0.25rem', 
              overflowX: 'auto',
              border: '1px solid var(--border-light)',
              marginBottom: '0.5rem'
            }}>
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
                  aria-label={`Switch to ${tab.label} tab`}
                  style={{
                    border: 'none',
                    background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-muted)',
                    fontWeight: activeTab === tab.key ? '700' : '600',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.25s ease',
                    whiteSpace: 'nowrap',
                    boxShadow: activeTab === tab.key ? '0 4px 12px rgba(16, 185, 129, 0.08)' : 'none',
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>Transportation Calculator</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Enter details about your weekly commutes and flights taken</p>
                  </div>
                  
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Weekly Commutes (Land)</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="petrol-km">Car Distance (Petrol/Diesel km/week)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input 
                            type="number" id="petrol-km" className="form-control" 
                            value={transit.carPetrolKm} 
                            style={{ paddingRight: '4.5rem' }}
                            onChange={(e) => setTransit(prev => ({ ...prev, carPetrolKm: Number(e.target.value) }))}
                          />
                          <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>km/wk</span>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="elec-km">Car Distance (Electric km/week)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input 
                            type="number" id="elec-km" className="form-control" 
                            value={transit.carElectricKm} 
                            style={{ paddingRight: '4.5rem' }}
                            onChange={(e) => setTransit(prev => ({ ...prev, carElectricKm: Number(e.target.value) }))}
                          />
                          <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>km/wk</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="bus-km">Bus Travel (km/week)</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="number" id="bus-km" className="form-control" 
                          value={transit.busKm} 
                          style={{ paddingRight: '4.5rem' }}
                          onChange={(e) => setTransit(prev => ({ ...prev, busKm: Number(e.target.value) }))}
                        />
                        <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>km/wk</span>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="train-km">Train / Metro (km/week)</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                          type="number" id="train-km" className="form-control" 
                          value={transit.trainKm} 
                          style={{ paddingRight: '4.5rem' }}
                          onChange={(e) => setTransit(prev => ({ ...prev, trainKm: Number(e.target.value) }))}
                        />
                        <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>km/wk</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem', marginTop: '0.5rem' }}>Flight Distances (Annual)</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="short-flights">Short-Haul Flights (&lt; 3hrs total km)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input 
                            type="number" id="short-flights" className="form-control" 
                            value={transit.shortFlightAnnual} 
                            style={{ paddingRight: '4.5rem' }}
                            onChange={(e) => setTransit(prev => ({ ...prev, shortFlightAnnual: Number(e.target.value) }))}
                          />
                          <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>km/yr</span>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="long-flights">Long-Haul Flights (&gt; 6hrs total km)</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input 
                            type="number" id="long-flights" className="form-control" 
                            value={transit.longFlightAnnual} 
                            style={{ paddingRight: '4.5rem' }}
                            onChange={(e) => setTransit(prev => ({ ...prev, longFlightAnnual: Number(e.target.value) }))}
                          />
                          <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>km/yr</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="seating-select">Travel Seating Class</label>
                    <select
                      id="seating-select"
                      className="form-control"
                      value={transit.seatingClass}
                      onChange={(e) => setTransit(prev => ({ ...prev, seatingClass: e.target.value }))}
                      style={{ height: 'auto', padding: '0.8rem 1rem', cursor: 'pointer' }}
                    >
                      <option value="economy">Economy Class</option>
                      <option value="business">Business Class</option>
                      <option value="first">First Class</option>
                    </select>
                  </div>

                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '1rem 1.25rem', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderLeft: '4px solid var(--accent-primary)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4'
                  }}>
                    <strong>Sustainability Tip:</strong> Taking public transit instead of a gasoline vehicle reduces transport emissions by up to 80% per kilometer.
                  </div>
                </div>
              )}

              {/* Energy Tab */}
              {activeTab === 'energy' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>Home Energy Calculator</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Provide electricity, heating, and water utility inputs</p>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="electricity-kwh">Electricity Usage (kWh/month)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" id="electricity-kwh" className="form-control"
                        value={energy.electricityKwh}
                        style={{ paddingRight: '5.5rem' }}
                        onChange={(e) => setEnergy(prev => ({ ...prev, electricityKwh: Number(e.target.value) }))}
                      />
                      <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>kWh/mo</span>
                    </div>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="gas-therms">Natural Gas (therms/month)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" id="gas-therms" className="form-control"
                        value={energy.gasTherms}
                        style={{ paddingRight: '6.5rem' }}
                        onChange={(e) => setEnergy(prev => ({ ...prev, gasTherms: Number(e.target.value) }))}
                      />
                      <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>therms/mo</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="water-litres">Water Consumption (litres/month)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" id="water-litres" className="form-control"
                        value={energy.waterLitres}
                        style={{ paddingRight: '4.5rem' }}
                        onChange={(e) => setEnergy(prev => ({ ...prev, waterLitres: Number(e.target.value) }))}
                      />
                      <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>litres/mo</span>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '1rem 1.25rem', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderLeft: '4px solid var(--accent-primary)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4'
                  }}>
                    <strong>Sustainability Tip:</strong> Lowering your home thermostat by just 1°C can save up to 10% on your natural gas heating emissions.
                  </div>
                </div>
              )}

              {/* Food Tab */}
              {activeTab === 'food' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>Dietary Habits</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select the diet profile that best represents your eating habits</p>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="diet-select">Diet Type</label>
                    <select
                      id="diet-select"
                      className="form-control"
                      value={food.dietType}
                      onChange={(e) => setFood(prev => ({ ...prev, dietType: e.target.value }))}
                      style={{ height: 'auto', padding: '0.8rem 1rem', cursor: 'pointer' }}
                    >
                      <option value="highMeat">High Meat (Heavy beef/lamb consumer)</option>
                      <option value="lowMeat">Low Meat / Flexitarian (Poultry/fish focus)</option>
                      <option value="vegetarian">Vegetarian (No meat/fish)</option>
                      <option value="vegan">Vegan (Strict plant-based)</option>
                    </select>
                  </div>

                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '1rem 1.25rem', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderLeft: '4px solid var(--accent-primary)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4'
                  }}>
                    <strong>Sustainability Tip:</strong> Plant-based diets produce up to 75% fewer diet-related greenhouse gas emissions than high-meat alternatives.
                  </div>
                </div>
              )}

              {/* Shopping Tab */}
              {activeTab === 'shopping' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>Shopping & Consumption</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Enter average monthly expenditure on commercial goods</p>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="clothing-spend">Clothing Purchases ($/month)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '1rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', pointerEvents: 'none' }}>$</span>
                      <input 
                        type="number" id="clothing-spend" className="form-control"
                        value={shopping.clothingSpend}
                        style={{ paddingLeft: '2rem', paddingRight: '4.5rem' }}
                        onChange={(e) => setShopping(prev => ({ ...prev, clothingSpend: Number(e.target.value) }))}
                      />
                      <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>USD/mo</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="electronics-spend">Electronics & Devices ($/month)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '1rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)', pointerEvents: 'none' }}>$</span>
                      <input 
                        type="number" id="electronics-spend" className="form-control"
                        value={shopping.electronicsSpend}
                        style={{ paddingLeft: '2rem', paddingRight: '4.5rem' }}
                        onChange={(e) => setShopping(prev => ({ ...prev, electronicsSpend: Number(e.target.value) }))}
                      />
                      <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>USD/mo</span>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '1rem 1.25rem', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderLeft: '4px solid var(--accent-primary)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4'
                  }}>
                    <strong>Sustainability Tip:</strong> Repairing old electronics and choosing high-quality, circular fashion models reduces manufacturing footprint significantly.
                  </div>
                </div>
              )}

              {/* Waste Tab */}
              {activeTab === 'waste' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.25rem' }}>Waste & Recycling</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Enter household refuse volumes and recycling patterns</p>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="waste-mass">Garbage Generated (kg/week)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" id="waste-mass" className="form-control"
                        value={waste.wasteKg}
                        style={{ paddingRight: '4.5rem' }}
                        onChange={(e) => setWaste(prev => ({ ...prev, wasteKg: Number(e.target.value) }))}
                      />
                      <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>kg/wk</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="recycling-rate">Recycling Divert Rate (%)</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input 
                        type="number" id="recycling-rate" className="form-control"
                        value={waste.recyclingRate}
                        style={{ paddingRight: '3rem' }}
                        onChange={(e) => setWaste(prev => ({ ...prev, recyclingRate: Number(e.target.value) }))}
                      />
                      <span style={{ position: 'absolute', right: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', pointerEvents: 'none' }}>%</span>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '1rem 1.25rem', 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderLeft: '4px solid var(--accent-primary)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4'
                  }}>
                    <strong>Sustainability Tip:</strong> Diverting organic waste to compost stops anaerobic decomposition in landfills, reducing methane release.
                  </div>
                </div>
              )}

            </div>
          </Card>

          {/* Right Navy Widget Panel */}
          <div className="calculator-sidebar" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Card style={{ 
              background: 'linear-gradient(135deg, #0e1e2d 0%, #071018 100%)', 
              color: '#ffffff', 
              borderRadius: '20px', 
              padding: '1.75rem', 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 35px rgba(10, 29, 45, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>RUNNING TOTAL</span>
                    <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.15rem 0', color: '#ffffff', fontFamily: 'monospace', lineHeight: 1 }}>
                      {runningTotalCo2} <span style={{ fontSize: '1rem', color: '#06b6d4', fontWeight: 700 }}>kg CO2e</span>
                    </p>
                  </div>
                  <div style={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.12)', 
                    border: '1px solid rgba(16, 185, 129, 0.2)', 
                    padding: '0.35rem 0.6rem', 
                    borderRadius: '8px', 
                    fontSize: '0.7rem', 
                    color: '#10b981', 
                    fontWeight: 700 
                  }}>
                    ESTIMATED
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                  Sum of all categories calculated dynamically in real-time.
                </p>

                {/* Category breakdowns */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>LIVE CATEGORY BREAKDOWN</span>
                  
                  {/* Transit progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                        Transit
                      </span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalTransitCo2.toFixed(1)} kg</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (totalTransitCo2 / Math.max(1, runningTotalCo2)) * 100)}%`, backgroundColor: '#38bdf8', height: '100%', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Energy progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                        Energy
                      </span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalEnergyCo2.toFixed(1)} kg</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (totalEnergyCo2 / Math.max(1, runningTotalCo2)) * 100)}%`, backgroundColor: '#f59e0b', height: '100%', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Food progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        Food
                      </span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalFoodCo2.toFixed(1)} kg</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (totalFoodCo2 / Math.max(1, runningTotalCo2)) * 100)}%`, backgroundColor: '#10b981', height: '100%', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Shopping progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#818cf8' }} />
                        Shopping
                      </span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalShoppingCo2.toFixed(1)} kg</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (totalShoppingCo2 / Math.max(1, runningTotalCo2)) * 100)}%`, backgroundColor: '#818cf8', height: '100%', borderRadius: '3px' }} />
                    </div>
                  </div>

                  {/* Waste progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                        Waste
                      </span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalWasteCo2.toFixed(1)} kg</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (totalWasteCo2 / Math.max(1, runningTotalCo2)) * 100)}%`, backgroundColor: '#94a3b8', height: '100%', borderRadius: '3px' }} />
                    </div>
                  </div>

                </div>

                {/* Benchmark Bar */}
                <div style={{ marginBottom: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    WEEKLY BENCHMARK COMPARISON
                  </span>
                  <div style={{ height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '5px', position: 'relative', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%',
                        width: `${currentTotalPercent}%`, 
                        background: runningTotalCo2 > 90 
                          ? 'linear-gradient(90deg, #ef4444, #f87171)' 
                          : runningTotalCo2 > 38.5 
                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                            : 'linear-gradient(90deg, #10b981, #34d399)',
                        borderRadius: '5px',
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} 
                    />
                    {/* Target markers */}
                    <div style={{ position: 'absolute', left: '31.6%', top: 0, bottom: 0, width: '2px', backgroundColor: '#ffffff', opacity: 0.6 }} title="Safe Target (38kg/week)" />
                    <div style={{ position: 'absolute', left: '75%', top: 0, bottom: 0, width: '2px', backgroundColor: '#ffffff', opacity: 0.6 }} title="World Average (90kg/week)" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.5rem', fontWeight: 600 }}>
                    <span style={{ color: '#34d399' }}>Safe Target: ~38 kg</span>
                    <span style={{ color: '#fbbf24' }}>World Avg: ~90 kg</span>
                  </div>
                </div>

              </div>

              <button 
                onClick={handleLogEntry}
                className="btn btn-primary"
                aria-label={`Log ${activeTab} carbon entry`}
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.9rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease',
                  marginTop: '0.5rem'
                }}
              >
                Log {activeTab.toUpperCase()} Entry
              </button>
            </Card>
          </div>

        </div>
      </div>

      {/* Bottom Optional Notes */}
      <Card className="soft-card" style={{ padding: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="log-notes" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Log Notes (Optional)</label>
          <textarea 
            id="log-notes" 
            className="form-control" 
            rows="2" 
            placeholder="e.g. Weekly commute breakdown or specific item purchases"
            value={logNotes}
            style={{ borderRadius: '10px', resize: 'vertical' }}
            onChange={(e) => setLogNotes(e.target.value)}
          />
        </div>
      </Card>
    </div>
  );
}
