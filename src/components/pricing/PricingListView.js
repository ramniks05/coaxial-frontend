import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getCourseTypes, getCoursesByCourseType, getClassesByCourse, getExamsByCourse } from '../../services/masterDataService';
import { filterPricing } from '../../services/pricingService';

const PricingListView = () => {
  const { token, addNotification } = useApp();

  const [level, setLevel] = useState('');
  const [courseTypes, setCourseTypes] = useState([]);
  const [courseTypeId, setCourseTypeId] = useState('');
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [children, setChildren] = useState([]);
  const [childId, setChildId] = useState('');
  const [planType, setPlanType] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  const [loadingCT, setLoadingCT] = useState(false);
  const [loadingC, setLoadingC] = useState(false);
  const [loadingChild, setLoadingChild] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pricingData, setPricingData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCT(true);
        const data = await getCourseTypes(token);
        const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
        if (!cancelled) setCourseTypes(arr);
      } catch (e) {
        addNotification({ type: 'error', message: 'Failed to load course types: ' + e.message, duration: 6000 });
      } finally {
        if (!cancelled) setLoadingCT(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, addNotification]);

  useEffect(() => {
    setCourses([]);
    setCourseId('');
    setChildren([]);
    setChildId('');
    if (!courseTypeId) return;

    (async () => {
      try {
        setLoadingC(true);
        const data = await getCoursesByCourseType(token, courseTypeId);
        const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
        setCourses(arr);
      } catch (e) {
        addNotification({ type: 'error', message: 'Failed to load courses: ' + e.message, duration: 6000 });
      } finally {
        setLoadingC(false);
      }
    })();
  }, [courseTypeId, token, addNotification]);

  useEffect(() => {
    setChildren([]);
    setChildId('');
    if (!courseId || !level || level === 'COURSE') return;

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
        addNotification({ type: 'error', message: 'Failed to load ' + level.toLowerCase() + 's: ' + e.message, duration: 6000 });
      } finally {
        setLoadingChild(false);
      }
    })();
  }, [courseId, level, token, addNotification]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (courseTypeId) filters.courseTypeId = courseTypeId;
      if (level) filters.entityType = level;
      if (courseId) filters.courseId = courseId;
      if (childId) filters.entityId = childId;
      if (activeFilter) filters.isActive = activeFilter === 'true';
      if (searchText) filters.search = searchText;

      const response = await filterPricing(token, filters);
      
      if (response.success && response.data) {
        setPricingData(response.data);
        addNotification({ 
          type: 'success', 
          message: response.message || 'Pricing data loaded successfully', 
          duration: 3000 
        });
      } else {
        setPricingData([]);
        addNotification({ type: 'info', message: 'No pricing data found', duration: 3000 });
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      addNotification({ 
        type: 'error', 
        message: 'Failed to fetch pricing: ' + error.message, 
        duration: 6000 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLevel('');
    setCourseTypeId('');
    setCourseId('');
    setChildId('');
    setPlanType('');
    setActiveFilter('');
    setSearchText('');
    setPricingData([]);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>View Pricing & Offers</h3>
        <p>Filter and view existing pricing configurations</p>
      </div>
      <div className="card-body">
        <div className="form-section">
          <h4 className="text-lg font-semibold mb-4">Filters</h4>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">All Levels</option>
                <option value="COURSE">Course</option>
                <option value="CLASS">Class</option>
                <option value="EXAM">Exam</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Course Type</label>
              <select className="form-select" value={courseTypeId} onChange={(e) => setCourseTypeId(e.target.value)} disabled={loadingCT}>
                <option value="">All Course Types</option>
                {courseTypes.map((ct) => (<option key={ct.id} value={ct.id}>{ct.name}</option>))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Course</label>
              <select className="form-select" value={courseId} onChange={(e) => setCourseId(e.target.value)} disabled={!courseTypeId || loadingC}>
                <option value="">All Courses</option>
                {courses.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {level && level !== 'COURSE' && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">{level === 'CLASS' ? 'Class' : 'Exam'}</label>
                <select className="form-select" value={childId} onChange={(e) => setChildId(e.target.value)} disabled={!courseId || loadingChild}>
                  <option value="">All {level === 'CLASS' ? 'Classes' : 'Exams'}</option>
                  {children.map((ch) => (<option key={ch.id} value={ch.id}>{ch.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Search</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search by name..." 
                  value={searchText} 
                  onChange={(e) => setSearchText(e.target.value)} 
                />
              </div>
            </div>
          )}

          {(!level || level === 'COURSE') && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">Search</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search by name..." 
                  value={searchText} 
                  onChange={(e) => setSearchText(e.target.value)} 
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button className="btn btn-outline" onClick={handleReset}>Reset Filters</button>
          </div>
        </div>

        {pricingData.length > 0 && (
          <div className="form-section mt-6">
            <h4 className="text-lg font-semibold mb-4">Pricing Results ({pricingData.length} items)</h4>
            <div className="overflow-x-auto">
              {pricingData.map((item) => (
                <div key={item.id} className="pricing-group-card mb-6">
                  <div className="pricing-group-header">
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-600 text-white">
                        {item.entityType}
                      </span>
                      <h5 className="text-lg font-bold text-gray-800">{item.entityName}</h5>
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                        {item.courseTypeName}
                      </span>
                      {item.isActive ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">Inactive</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-outline btn-sm">Edit All</button>
                      <button className="btn btn-danger btn-sm">Delete</button>
                    </div>
                  </div>
                  
                  <table className="pricing-detail-table">
                    <thead>
                      <tr>
                        <th style={{width: '120px'}}>Plan Type</th>
                        <th style={{width: '140px', textAlign: 'right'}}>Base Price</th>
                        <th style={{width: '120px', textAlign: 'center'}}>Discount</th>
                        <th style={{width: '140px', textAlign: 'right'}}>Final Price</th>
                        <th style={{width: '180px'}}>Offer Valid From</th>
                        <th style={{width: '180px'}}>Offer Valid To</th>
                        <th style={{width: '100px', textAlign: 'center'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.monthlyPrice > 0 && (
                        <tr className="plan-row-monthly">
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="plan-icon">📅</span>
                              <span className="font-semibold text-purple-700">Monthly</span>
                            </div>
                          </td>
                          <td style={{textAlign: 'right'}} className="text-gray-700">{item.monthlyPrice?.toFixed(2)}</td>
                          <td style={{textAlign: 'center'}}>
                            <span className="discount-badge">{item.monthlyDiscountPercent || 0}%</span>
                          </td>
                          <td style={{textAlign: 'right'}} className="font-bold text-green-600 text-lg">
                            {item.monthlyFinalPrice?.toFixed(2)}
                          </td>
                          <td className="text-sm text-gray-600">{formatDate(item.monthlyOfferValidFrom)}</td>
                          <td className="text-sm text-gray-600">{formatDate(item.monthlyOfferValidTo)}</td>
                          <td style={{textAlign: 'center'}}>
                            <button className="btn btn-outline btn-xs">Edit</button>
                          </td>
                        </tr>
                      )}
                      {item.quarterlyPrice > 0 && (
                        <tr className="plan-row-quarterly">
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="plan-icon">📊</span>
                              <span className="font-semibold text-blue-700">Quarterly</span>
                            </div>
                          </td>
                          <td style={{textAlign: 'right'}} className="text-gray-700">{item.quarterlyPrice?.toFixed(2)}</td>
                          <td style={{textAlign: 'center'}}>
                            <span className="discount-badge">{item.quarterlyDiscountPercent || 0}%</span>
                          </td>
                          <td style={{textAlign: 'right'}} className="font-bold text-green-600 text-lg">
                            {item.quarterlyFinalPrice?.toFixed(2)}
                          </td>
                          <td className="text-sm text-gray-600">{formatDate(item.quarterlyOfferValidFrom)}</td>
                          <td className="text-sm text-gray-600">{formatDate(item.quarterlyOfferValidTo)}</td>
                          <td style={{textAlign: 'center'}}>
                            <button className="btn btn-outline btn-xs">Edit</button>
                          </td>
                        </tr>
                      )}
                      {item.yearlyPrice > 0 && (
                        <tr className="plan-row-yearly">
                          <td>
                            <div className="flex items-center gap-2">
                              <span className="plan-icon">🎯</span>
                              <span className="font-semibold text-orange-700">Yearly</span>
                            </div>
                          </td>
                          <td style={{textAlign: 'right'}} className="text-gray-700">{item.yearlyPrice?.toFixed(2)}</td>
                          <td style={{textAlign: 'center'}}>
                            <span className="discount-badge">{item.yearlyDiscountPercent || 0}%</span>
                          </td>
                          <td style={{textAlign: 'right'}} className="font-bold text-green-600 text-lg">
                            {item.yearlyFinalPrice?.toFixed(2)}
                          </td>
                          <td className="text-sm text-gray-600">{formatDate(item.yearlyOfferValidFrom)}</td>
                          <td className="text-sm text-gray-600">{formatDate(item.yearlyOfferValidTo)}</td>
                          <td style={{textAlign: 'center'}}>
                            <button className="btn btn-outline btn-xs">Edit</button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && pricingData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium">No pricing data found</p>
            <p className="text-sm mt-2">Use filters and click Search to view pricing configurations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingListView;
