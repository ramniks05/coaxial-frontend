import React, { useState } from 'react';

const PlanRow = ({ label, values, onChange }) => {
  const { basePrice, discountPercent, currency, effectiveFrom, effectiveTo, active } = values;
  const finalPrice = basePrice ? Math.round(basePrice * (1 - (discountPercent || 0) / 100)) : 0;
  return (
    <div className="plan-row">
      <div className="plan-label">{label}</div>
      <input type="number" placeholder="Base Price" value={basePrice || ''} onChange={e => onChange({ basePrice: Number(e.target.value) })} />
      <input type="number" placeholder="Discount %" value={discountPercent || ''} onChange={e => onChange({ discountPercent: Number(e.target.value) })} />
      <input type="text" placeholder="Currency" value={currency || 'INR'} onChange={e => onChange({ currency: e.target.value })} />
      <input type="date" value={effectiveFrom || ''} onChange={e => onChange({ effectiveFrom: e.target.value })} />
      <input type="date" value={effectiveTo || ''} onChange={e => onChange({ effectiveTo: e.target.value })} />
      <div className="final-price">₹{finalPrice}</div>
      <label className="toggle">
        <input type="checkbox" checked={!!active} onChange={e => onChange({ active: e.target.checked })} />
        <span>Active</span>
      </label>
      <button className="btn btn-primary btn-sm" onClick={() => alert('Save plan')}>Save</button>
    </div>
  );
};

const CoursePlansTab = () => {
  const [courseId, setCourseId] = useState('');
  const [monthly, setMonthly] = useState({ currency: 'INR', active: true });
  const [quarterly, setQuarterly] = useState({ currency: 'INR', active: true });
  const [yearly, setYearly] = useState({ currency: 'INR', active: true });

  return (
    <div className="course-plans">
      <div className="filters">
        <input placeholder="Course ID" value={courseId} onChange={e => setCourseId(e.target.value)} />
        <button className="btn btn-outline btn-sm" onClick={() => { /* load existing plans */ }}>Load</button>
      </div>
      <div className="plans-grid">
        <PlanRow label="Monthly" values={monthly} onChange={u => setMonthly(prev => ({ ...prev, ...u }))} />
        <PlanRow label="Quarterly" values={quarterly} onChange={u => setQuarterly(prev => ({ ...prev, ...u }))} />
        <PlanRow label="Yearly" values={yearly} onChange={u => setYearly(prev => ({ ...prev, ...u }))} />
      </div>
    </div>
  );
};

export default CoursePlansTab;


