// components/FilterBar.js
import React from 'react';
import '../styles/FilterBar.css';

const FilterBar = ({ 
    filters, 
    setFilters, 
    sortBy, 
    setSortBy, 
    sortOrder, 
    setSortOrder, 
    users, 
    taskCounts 
}) => {
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    };

    const clearAllFilters = () => {
        setFilters({
            priority: 'all',
            assignedUser: 'all',
            search: ''
        });
        setSortBy('createdAt');
        setSortOrder('desc');
    };

    return (
  <div className="filter-bar">
    {/* TOP ROW */}
    <div className="filter-top">

      {/* SEARCH */}
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="search-input"
        />
      </div>

      {/* FILTERS */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Priority</label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Assigned To</label>
          <select
            value={filters.assignedUser}
            onChange={(e) => handleFilterChange('assignedUser', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SORT */}
      <div className="sort-section">
        <span className="sort-label">Sort by</span>
        <div className="sort-buttons">
          {['createdAt', 'title', 'priority', 'assignedUser'].map(field => (
            <button
              key={field}
              className={`sort-btn ${sortBy === field ? 'active' : ''}`}
              onClick={() => handleSortChange(field)}
            >
              {field === 'createdAt' ? 'Date' : field}
              {sortBy === field && (
                <span className="sort-indicator">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div className="task-stats">
        {[
          ['Total', taskCounts.total],
          ['To Do', taskCounts.todo],
          ['In Progress', taskCounts.inProgress],
          ['Done', taskCounts.done],
        ].map(([label, value]) => (
          <div key={label} className="stat-item">
            <span className="stat-number">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

    </div>

    {/* BOTTOM ROW */}
    <div className="filter-bottom">
      <button className="clear-filters-btn" onClick={clearAllFilters}>
        Clear All Filters
      </button>
    </div>
  </div>
);

};

export default FilterBar;