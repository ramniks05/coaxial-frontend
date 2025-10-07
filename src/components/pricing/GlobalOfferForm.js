import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getCourseTypes } from '../../services/masterDataService';
import { bulkUpdateDiscountByCourseType } from '../../services/pricingService';

const GlobalOfferForm = () => {
  const { token, addNotification } = useApp();

  const [courseTypes, setCourseTypes] = useState([]);
  const [courseTypeId, setCourseTypeId] = useState('');
  const [level, setLevel] = useState('COURSE');
  const [loadingCT, setLoadingCT] = useState(false);

  const [monthlyDiscount, setMonthlyDiscount] = useState(0);
  const [quarterlyDiscount, setQuarterlyDiscount] = useState(0);
  const [yearlyDiscount, setYearlyDiscount] = useState(0);

  const [schedule, setSchedule] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCT(true);
        const data = await getCourseTypes(token);
        const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
        if (!cancelled) setCourseTypes(arr);
      } catch (e) {
        addNotification({ type: 'error', message: `Failed to load course types: ${e.message}`, duration: 6000 });
      } finally {
        if (!cancelled) setLoadingCT(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, addNotification]);

  const canApply = useMemo(() => {
    if (!courseTypeId) return false;
    if (monthlyDiscount === 0 && quarterlyDiscount === 0 && yearlyDiscount === 0) return false;
    if (schedule && (!effectiveFrom || !effectiveTo)) return false;
    return true;
  }, [courseTypeId, monthlyDiscount, quarterlyDiscount, yearlyDiscount, schedule, effectiveFrom, effectiveTo]);

  const resetForm = () => {
    setMonthlyDiscount(0);
    setQuarterlyDiscount(0);
    setYearlyDiscount(0);
    setSchedule(false);
    setEffectiveFrom('');
    setEffectiveTo('');
    setEffectiveDate('');
  };

  const applyOffer = async () => {
    if (!canApply) {
      addNotification({ type: 'error', message: 'Please fill all required fields', duration: 4000 });
      return;
    }

    try {
      const selectedCourseType = courseTypes.find(ct => ct.id === parseInt(courseTypeId));

      const formatDateTime = (dateStr) => {
        if (!dateStr) return null;
        return `${dateStr}T00:00:00`;
      };

      const globalOfferData = {
        courseTypeId: parseInt(courseTypeId),
        level: level,
        monthlyDiscountPercent: monthlyDiscount,
        quarterlyDiscountPercent: quarterlyDiscount,
        yearlyDiscountPercent: yearlyDiscount,
        offerValidFrom: schedule ? formatDateTime(effectiveFrom) : null,
        offerValidTo: schedule ? formatDateTime(effectiveTo) : null,
        effectiveDate: effectiveDate ? formatDateTime(effectiveDate) : formatDateTime(new Date().toISOString().split('T')[0])
      };

      await bulkUpdateDiscountByCourseType(token, globalOfferData);

      addNotification({
        type: 'success',
        message: `Global offer applied to all ${level.toLowerCase()}s under ${selectedCourseType?.name}`,
        duration: 4000
      });

      resetForm();

    } catch (error) {
      console.error('Error applying global offer:', error);
      addNotification({
        type: 'error',
        message: `Failed to apply global offer: ${error.message}`,
        duration: 6000
      });
    }
  };

  const getLevelDescription = () => {
    switch (level) {
      case 'COURSE':
        return 'Update all courses of this course type';
      case 'CLASS':
        return 'Update all classes whose course has this course type';
      case 'EXAM':
        return 'Update all exams related to this course type';
      default:
        return '';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Global Offer Management</h3>
        <p>Apply discount globally to all {level === 'COURSE' ? 'Courses' : level === 'CLASS' ? 'Classes' : 'Exams'} of a Course Type</p>
      </div>
      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Course Type *</label>
            <select className="form-select" value={courseTypeId} onChange={e => setCourseTypeId(e.target.value)} disabled={loadingCT}>
              <option value="">Select Course Type</option>
              {courseTypes.map(ct => (<option key={ct.id} value={ct.id}>{ct.name}</option>))}
            </select>
          </div>
        </div>

        <div className="form-row mt-4">
          <div className="form-group">
            <label className="form-label">Apply To Level *</label>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2"><input type="radio" value="COURSE" checked={level === 'COURSE'} onChange={e => setLevel(e.target.value)} /><span>Course</span></label>
              <label className="flex items-center gap-2"><input type="radio" value="CLASS" checked={level === 'CLASS'} onChange={e => setLevel(e.target.value)} /><span>Class</span></label>
              <label className="flex items-center gap-2"><input type="radio" value="EXAM" checked={level === 'EXAM'} onChange={e => setLevel(e.target.value)} /><span>Exam</span></label>
            </div>
            <p className="text-sm text-gray-500 mt-2">{getLevelDescription()}</p>
          </div>
        </div>

        <div className="form-section mt-6">
          <h4 className="text-lg font-semibold mb-4">Discount Settings</h4>
          <div className="grid grid-cols-3 gap-6">
            <div className="form-group">
              <label className="form-label">Monthly Discount % *</label>
              <input className="form-input" type="number" placeholder="0-100" value={monthlyDiscount} onChange={e => setMonthlyDiscount(Math.min(100, Math.max(0, Number(e.target.value || 0))))} />
            </div>
            <div className="form-group">
              <label className="form-label">Quarterly Discount % *</label>
              <input className="form-input" type="number" placeholder="0-100" value={quarterlyDiscount} onChange={e => setQuarterlyDiscount(Math.min(100, Math.max(0, Number(e.target.value || 0))))} />
            </div>
            <div className="form-group">
              <label className="form-label">Yearly Discount % *</label>
              <input className="form-input" type="number" placeholder="0-100" value={yearlyDiscount} onChange={e => setYearlyDiscount(Math.min(100, Math.max(0, Number(e.target.value || 0))))} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">At least one discount must be greater than 0</p>
        </div>

        <div className="form-row mt-6">
          <div className="form-group">
            <label className="form-label">Effective Date</label>
            <input className="form-input" type="date" value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
            <p className="text-sm text-gray-500 mt-1">When should this offer take effect? (defaults to today)</p>
          </div>
        </div>

        <div className="form-row mt-6">
          <div className="form-group">
            <label className="form-label">Schedule Offer (Optional)</label>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={schedule} onChange={e => setSchedule(e.target.checked)} />
              <span className="text-sm">Enable offer validity dates</span>
            </div>
          </div>
        </div>

        {schedule && (
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="form-group">
              <label className="form-label">Offer Valid From *</label>
              <input className="form-input" type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Offer Valid To *</label>
              <input className="form-input" type="date" value={effectiveTo} onChange={e => setEffectiveTo(e.target.value)} />
            </div>
          </div>
        )}
      </div>
      <div className="card-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={resetForm}>Reset</button>
        <button className="btn btn-primary" disabled={!canApply} onClick={applyOffer}>Apply Global Offer</button>
      </div>
    </div>
  );
};

export default GlobalOfferForm;