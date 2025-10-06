import React, { useState } from 'react';

const PlansIndex = () => {
  const [filters, setFilters] = useState({ level: '', ref: '', template: '', active: '' });
  const rows = [
    { id: 1, level: 'COURSE', refName: 'Physics Course', template: 'MONTHLY', base: 500, disc: 10, final: 450, active: true, effective: '2025-01-01 → 2025-12-31' },
    { id: 2, level: 'CLASS', refName: 'Grade 10', template: 'YEARLY', base: 5000, disc: 20, final: 4000, active: true, effective: '2025-01-01 → 2025-12-31' }
  ];

  return (
    <div className="plans-index">
      <div className="filters">
        <select value={filters.level} onChange={e => setFilters({ ...filters, level: e.target.value })}>
          <option value="">All Levels</option>
          <option value="COURSE">Course</option>
          <option value="CLASS">Class</option>
          <option value="EXAM">Exam</option>
        </select>
        <input placeholder="Ref Name / ID" value={filters.ref} onChange={e => setFilters({ ...filters, ref: e.target.value })} />
        <select value={filters.template} onChange={e => setFilters({ ...filters, template: e.target.value })}>
          <option value="">All Templates</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="YEARLY">Yearly</option>
        </select>
        <select value={filters.active} onChange={e => setFilters({ ...filters, active: e.target.value })}>
          <option value="">Any Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button className="btn btn-outline btn-sm">Search</button>
      </div>

      <div className="plans-table-wrapper">
        <table className="plans-table">
          <thead>
            <tr>
              <th>Level</th><th>Ref</th><th>Template</th><th>Base</th><th>Discount</th><th>Final</th><th>Active</th><th>Effective</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.level}</td><td>{r.refName}</td><td>{r.template}</td><td>₹{r.base}</td><td>{r.disc}%</td><td>₹{r.final}</td><td>{r.active ? 'Yes' : 'No'}</td><td>{r.effective}</td>
                <td>
                  <button className="btn btn-outline btn-xs">Edit</button>
                  <button className="btn btn-danger btn-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlansIndex;


