import React, { useState } from 'react';

const ReadonlyRow = ({ label, price, discount, finalPrice, source }) => (
  <div className="plan-row readonly">
    <div className="plan-label">{label}</div>
    <div className="ro">₹{price || 0}</div>
    <div className="ro">{discount || 0}%</div>
    <div className="ro">₹{finalPrice || 0}</div>
    <div className="ro source">{source}</div>
    <div className="actions"></div>
  </div>
);

const EditableRow = ({ label, values, onChange, onOverride }) => {
  const { basePrice, discountPercent } = values;
  const finalPrice = basePrice ? Math.round(basePrice * (1 - (discountPercent || 0) / 100)) : 0;
  return (
    <div className="plan-row">
      <div className="plan-label">{label}</div>
      <input type="number" placeholder="Base Price" value={basePrice || ''} onChange={e => onChange({ basePrice: Number(e.target.value) })} />
      <input type="number" placeholder="Discount %" value={discountPercent || ''} onChange={e => onChange({ discountPercent: Number(e.target.value) })} />
      <div className="final-price">₹{finalPrice}</div>
      <button className="btn btn-outline btn-sm" onClick={onOverride}>Override</button>
      <button className="btn btn-primary btn-sm" onClick={() => alert('Save override')}>Save</button>
    </div>
  );
};

const ClassExamPlansTab = () => {
  const [refType, setRefType] = useState('CLASS');
  const [refId, setRefId] = useState('');
  const [monthly, setMonthly] = useState({});
  const [quarterly, setQuarterly] = useState({});
  const [yearly, setYearly] = useState({});

  return (
    <div className="class-exam-plans">
      <div className="filters">
        <select value={refType} onChange={e => setRefType(e.target.value)}>
          <option value="CLASS">Class</option>
          <option value="EXAM">Exam</option>
        </select>
        <input placeholder={`${refType} ID`} value={refId} onChange={e => setRefId(e.target.value)} />
        <button className="btn btn-outline btn-sm" onClick={() => { /* load resolved + overrides */ }}>Load</button>
      </div>

      <h4>Inherited (from Course)</h4>
      <ReadonlyRow label="Monthly" price={500} discount={10} finalPrice={450} source="Course" />
      <ReadonlyRow label="Quarterly" price={1400} discount={15} finalPrice={1190} source="Course" />
      <ReadonlyRow label="Yearly" price={5000} discount={25} finalPrice={3750} source="Course" />

      <h4>Overrides</h4>
      <EditableRow label="Monthly" values={monthly} onChange={u => setMonthly(p => ({ ...p, ...u }))} onOverride={() => {}} />
      <EditableRow label="Quarterly" values={quarterly} onChange={u => setQuarterly(p => ({ ...p, ...u }))} onOverride={() => {}} />
      <EditableRow label="Yearly" values={yearly} onChange={u => setYearly(p => ({ ...p, ...u }))} onOverride={() => {}} />
    </div>
  );
};

export default ClassExamPlansTab;


