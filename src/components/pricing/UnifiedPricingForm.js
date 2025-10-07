import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
    getClassesByCourse,
    getCourseTypes,
    getCoursesByCourseType,
    getExamsByCourse
} from '../../services/masterDataService';
import {
    setCoursePricing,
    setClassPricing,
    setExamPricing
} from '../../services/pricingService';

const PlanRow = ({ label, values, onChange }) => {
  const { basePrice, discountPercent, effectiveFrom, effectiveTo, active } = values || {};
  const finalPrice = basePrice ? Math.round(basePrice * (1 - (discountPercent || 0) / 100)) : 0;

  return (
    <div className="plan-row grid grid-cols-6 gap-4 items-center">
      <div className="plan-label text-sm font-medium">{label}</div>
      <input
        className="form-input"
        type="number"
        placeholder="Base Price"
        value={basePrice ?? ''}
        onChange={e => onChange({ basePrice: Number(e.target.value || 0) })}
      />
      <input
        className="form-input"
        type="number"
        placeholder="Discount %"
        value={discountPercent ?? ''}
        onChange={e => onChange({ discountPercent: Math.min(100, Math.max(0, Number(e.target.value || 0))) })}
      />
      <input className="form-input" type="date" value={effectiveFrom || ''} onChange={e => onChange({ effectiveFrom: e.target.value })} />
      <input className="form-input" type="date" value={effectiveTo || ''} onChange={e => onChange({ effectiveTo: e.target.value })} />
      <div className="flex items-center gap-3">
        <div className="final-price text-sm font-semibold">₹{finalPrice}</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!active} onChange={e => onChange({ active: e.target.checked })} />
          <span className="text-sm">Active</span>
        </label>
      </div>
    </div>
  );
};

const UnifiedPricingForm = () => {
  const { token, addNotification } = useApp();

  // Level: COURSE | CLASS | EXAM
  const [level, setLevel] = useState('COURSE');

  // Cascading selects
  const [courseTypes, setCourseTypes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [children, setChildren] = useState([]); // classes or exams

  const [courseTypeId, setCourseTypeId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [childId, setChildId] = useState('');

  // Plans state
  const [monthly, setMonthly] = useState({ active: true });
  const [quarterly, setQuarterly] = useState({ active: true });
  const [yearly, setYearly] = useState({ active: true });

  const [loadingCT, setLoadingCT] = useState(false);
  const [loadingC, setLoadingC] = useState(false);
  const [loadingChild, setLoadingChild] = useState(false);

  const childLabel = useMemo(() => (level === 'CLASS' ? 'Class' : level === 'EXAM' ? 'Exam' : ''), [level]);

  // Load course types
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCT(true);
        const data = await getCourseTypes(token);
        const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
        
        // Filter course types based on level
        let filteredArr = arr;
        if (level === 'CLASS') {
          // Only show Academic Course type for classes
          filteredArr = arr.filter(ct => ct.name === 'Academic Course');
        } else if (level === 'EXAM') {
          // Only show Competitive Course type for exams
          filteredArr = arr.filter(ct => ct.name === 'Competitive Course');
        }
        // For COURSE level, show all course types
        
        if (!cancelled) setCourseTypes(filteredArr);
      } catch (e) {
        addNotification({ type: 'error', message: `Failed to load course types: ${e.message}`, duration: 6000 });
      } finally {
        if (!cancelled) setLoadingCT(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, addNotification, level]);

  // When courseType changes, load courses
  useEffect(() => {
    setCourses([]);
    setCourseId('');
    setChildren([]);
    setChildId('');
    if (!courseTypeId) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingC(true);
        const data = await getCoursesByCourseType(token, courseTypeId, controller.signal);
        const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
        setCourses(arr);
      } catch (e) {
        if (e.name !== 'AbortError') {
          addNotification({ type: 'error', message: `Failed to load courses: ${e.message}`, duration: 6000 });
        }
      } finally {
        setLoadingC(false);
      }
    })();
    return () => controller.abort();
  }, [courseTypeId, token, addNotification]);

  // When course changes and level is CLASS/EXAM, load children
  useEffect(() => {
    setChildren([]);
    setChildId('');
    if (!courseId) return;
    if (level === 'COURSE') return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingChild(true);
        if (level === 'CLASS') {
          const data = await getClassesByCourse(token, courseId, 0, 100, 'createdAt', 'desc');
          const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
          setChildren(arr);
        } else if (level === 'EXAM') {
          const data = await getExamsByCourse(token, courseId, 0, 100, 'createdAt', 'desc');
          const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
          setChildren(arr);
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          addNotification({ type: 'error', message: `Failed to load ${childLabel.toLowerCase()}s: ${e.message}`, duration: 6000 });
        }
      } finally {
        setLoadingChild(false);
      }
    })();
    return () => controller.abort();
  }, [courseId, level, token, addNotification, childLabel]);

  const resetPlans = () => {
    setMonthly({ active: true });
    setQuarterly({ active: true });
    setYearly({ active: true });
  };

  // Change handlers
  const onLevelChange = (e) => {
    const next = e.target.value;
    setLevel(next);
    setCourseTypeId(''); // Reset course type selection
    setCourseId(''); // Reset course selection
    setChildren([]);
    setChildId('');
    resetPlans();
  };

  const canSave = useMemo(() => {
    if (!courseTypeId || !courseId) return false;
    if (level !== 'COURSE' && !childId) return false;
    return true;
  }, [courseTypeId, courseId, childId, level]);

  const handleSave = async () => {
    if (!canSave) {
      addNotification({ type: 'error', message: 'Select required fields before saving', duration: 4000 });
      return;
    }

    // Validate that at least one plan has a base price
    if (!monthly.basePrice && !quarterly.basePrice && !yearly.basePrice) {
      addNotification({ type: 'error', message: 'At least one plan must have a base price', duration: 4000 });
      return;
    }

    try {
      // Get selected course and child (class/exam) names
      const selectedCourse = courses.find(c => c.id === parseInt(courseId));
      const selectedChild = level !== 'COURSE' ? children.find(ch => ch.id === parseInt(childId)) : null;
      
      // Helper function to format date to ISO string with time
      const formatDateTime = (dateStr) => {
        if (!dateStr) return null;
        return `${dateStr}T00:00:00`;
      };
      
      // Prepare base pricing data common to all levels
      const basePricingData = {
        courseTypeId: parseInt(courseTypeId),
        monthlyPrice: monthly.basePrice || 0,
        quarterlyPrice: quarterly.basePrice || 0,
        yearlyPrice: yearly.basePrice || 0,
        monthlyDiscountPercent: monthly.discountPercent || 0,
        monthlyOfferValidFrom: formatDateTime(monthly.effectiveFrom),
        monthlyOfferValidTo: formatDateTime(monthly.effectiveTo),
        quarterlyDiscountPercent: quarterly.discountPercent || 0,
        quarterlyOfferValidFrom: formatDateTime(quarterly.effectiveFrom),
        quarterlyOfferValidTo: formatDateTime(quarterly.effectiveTo),
        yearlyDiscountPercent: yearly.discountPercent || 0,
        yearlyOfferValidFrom: formatDateTime(yearly.effectiveFrom),
        yearlyOfferValidTo: formatDateTime(yearly.effectiveTo),
        isActive: monthly.active || quarterly.active || yearly.active
      };

      // Add the appropriate ID and name based on level
      if (level === 'CLASS') {
        const classPricingData = {
          classId: parseInt(childId),
          className: selectedChild?.name || '',
          courseId: parseInt(courseId),
          courseName: selectedCourse?.name || '',
          ...basePricingData
        };
        await setClassPricing(token, classPricingData);
      } else if (level === 'EXAM') {
        const examPricingData = {
          examId: parseInt(childId),
          examName: selectedChild?.name || '',
          ...basePricingData
        };
        await setExamPricing(token, examPricingData);
      } else {
        // COURSE level
        const coursePricingData = {
          courseId: parseInt(courseId),
          courseName: selectedCourse?.name || '',
          monthlyDurationDays: 30,
          quarterlyDurationDays: 90,
          yearlyDurationDays: 365,
          ...basePricingData
        };
        await setCoursePricing(token, coursePricingData);
      }
      
      addNotification({ 
        type: 'success', 
        message: `Successfully saved pricing for ${level.toLowerCase()} level`, 
        duration: 4000 
      });
      
      // Reset form after successful save
      resetPlans();
      
    } catch (error) {
      console.error('Error saving pricing:', error);
      addNotification({ 
        type: 'error', 
        message: `Failed to save pricing: ${error.message}`, 
        duration: 6000 
      });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Unified Pricing</h3>
        <p>Set Monthly, Quarterly, Yearly plans at Course or Class/Exam level</p>
      </div>

      <div className="card-body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Level</label>
            <div className="flex gap-4 items-center">
              <label><input type="radio" value="COURSE" checked={level === 'COURSE'} onChange={onLevelChange} /> Course</label>
              <label><input type="radio" value="CLASS" checked={level === 'CLASS'} onChange={onLevelChange} /> Class</label>
              <label><input type="radio" value="EXAM" checked={level === 'EXAM'} onChange={onLevelChange} /> Exam</label>
            </div>
          </div>
        </div>

        <div className="form-row grid grid-cols-3 gap-6">
          <div className="form-group">
            <label className="form-label">Course Type</label>
            <select className="form-select" value={courseTypeId} onChange={e => setCourseTypeId(e.target.value)} disabled={loadingCT}>
              <option value="">Select Course Type</option>
              {courseTypes.map(ct => (
                <option key={ct.id} value={ct.id}>{ct.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Course</label>
            <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)} disabled={!courseTypeId || loadingC}>
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {level !== 'COURSE' && (
            <div className="form-group">
              <label className="form-label">{childLabel}</label>
              <select className="form-select" value={childId} onChange={e => setChildId(e.target.value)} disabled={!courseId || loadingChild}>
                <option value="">Select {childLabel}</option>
                {children.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="plans-grid grid grid-cols-1 gap-4">
          <PlanRow label="Monthly" values={monthly} onChange={u => setMonthly(prev => ({ ...prev, ...u }))} />
          <PlanRow label="Quarterly" values={quarterly} onChange={u => setQuarterly(prev => ({ ...prev, ...u }))} />
          <PlanRow label="Yearly" values={yearly} onChange={u => setYearly(prev => ({ ...prev, ...u }))} />
        </div>
      </div>

      <div className="card-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={resetPlans}>Reset</button>
        <button className="btn btn-primary" disabled={!canSave} onClick={handleSave}>Save Pricing</button>
      </div>
    </div>
  );
};

export default UnifiedPricingForm;


