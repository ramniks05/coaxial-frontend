import React, { useMemo, useState } from 'react';

const GlobalOfferForm = () => {
  const [level, setLevel] = useState('COURSE'); // COURSE | CLASS | EXAM
  const [discountPercent, setDiscountPercent] = useState(0);
  const [schedule, setSchedule] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');

  const canApply = useMemo(() => {
    if (discountPercent < 0 || discountPercent > 100) return false;
    if (schedule && (!effectiveFrom || !effectiveTo)) return false;
    return true;
  }, [discountPercent, schedule, effectiveFrom, effectiveTo]);

  const applyOffer = () => {
    if (!canApply) return;
    console.log('Applying global offer', { level, discountPercent, schedule, effectiveFrom, effectiveTo });
    alert('Global offer applied (demo)');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Global Offers</h3>
        <p>Apply discount globally across all {level === 'COURSE' ? 'Courses' : level === 'CLASS' ? 'Classes' : 'Exams'}</p>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-3 gap-6">
          <div className="form-group">
            <label className="form-label">Level</label>
            <div className="flex gap-4 items-center">
              <label><input type="radio" value="COURSE" checked={level === 'COURSE'} onChange={e => setLevel(e.target.value)} /> Course</label>
              <label><input type="radio" value="CLASS" checked={level === 'CLASS'} onChange={e => setLevel(e.target.value)} /> Class</label>
              <label><input type="radio" value="EXAM" checked={level === 'EXAM'} onChange={e => setLevel(e.target.value)} /> Exam</label>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Discount %</label>
            <input className="form-input" type="number" value={discountPercent} onChange={e => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value || 0))))} />
          </div>
          <div className="form-group">
            <label className="form-label">Schedule pricing</label>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={schedule} onChange={e => setSchedule(e.target.checked)} />
              <span className="text-sm">Enable effective dates</span>
            </div>
          </div>
        </div>

        {schedule && (
          <div className="grid grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Effective From</label>
              <input className="form-input" type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Effective To</label>
              <input className="form-input" type="date" value={effectiveTo} onChange={e => setEffectiveTo(e.target.value)} />
            </div>
          </div>
        )}
      </div>
      <div className="card-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={() => { setDiscountPercent(0); setSchedule(false); setEffectiveFrom(''); setEffectiveTo(''); }}>Reset</button>
        <button className="btn btn-primary" disabled={!canApply} onClick={applyOffer}>Apply Offer</button>
      </div>
    </div>
  );
};

export default GlobalOfferForm;


