'use client';

import { useState, useEffect } from 'react';
import { getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * Modal component for displaying detailed click analytics
 */
export function AnalyticsDetailModal({
  isOpen,
  bannerId,
  onClose,
  totalClicks,
}: {
  isOpen: boolean;
  bannerId: string;
  onClose: () => void;
  totalClicks: number;
}) {
  const [analyticsRecords, setAnalyticsRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [clickTypeFilter, setClickTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bannerId) {
      loadAnalyticsRecords();
    }
  }, [isOpen, bannerId]);

  const loadAnalyticsRecords = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const apps = getApps();

        if (apps.length === 0) {
          console.warn('Firebase not initialized on client');
          setLoading(false);
          return;
        }

        const db = getFirestore(apps[0]);
        const analyticsRef = collection(db, 'banners', bannerId, 'analytics');
        const querySnapshot = await getDocs(query(analyticsRef, orderBy('clickedAt', 'desc')));

        const records = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          clickedAt: doc.data().clickedAt?.toDate?.() || new Date(doc.data().clickedAt),
        }));

        setAnalyticsRecords(records);
      }
    } catch (error) {
      console.error('Error loading analytics records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredRecords = analyticsRecords.filter(r => {
    if (selectedCountry && r.country !== selectedCountry) return false;
    if (clickTypeFilter && r.clickType !== clickTypeFilter) return false;
    return true;
  });

  const countries = Array.from(new Set(analyticsRecords.map(r => r.country).filter(Boolean)));
  const clickTypes = Array.from(new Set(analyticsRecords.map(r => r.clickType).filter(Boolean)));

  // Geographic distribution
  const geoDistribution = countries.reduce((acc: any, country) => {
    acc[country] = analyticsRecords.filter(r => r.country === country).length;
    return acc;
  }, {});

  // Click type distribution
  const clickDistribution = clickTypes.reduce((acc: any, type) => {
    acc[type] = analyticsRecords.filter(r => r.clickType === type).length;
    return acc;
  }, {});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📈 Analytics Details</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Summary Stats */}
        <div className="analytics-summary">
          <div className="stat-card primary">
            <span className="stat-label">Total Clicks</span>
            <span className="stat-value">{totalClicks}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Countries</span>
            <span className="stat-value">{countries.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Click Types</span>
            <span className="stat-value">{clickTypes.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Unique Users</span>
            <span className="stat-value">{Array.from(new Set(analyticsRecords.map(r => r.userId))).length}</span>
          </div>
        </div>

        {/* Distribution Cards */}
        <div className="distribution-section">
          <h3>Geographic Distribution</h3>
          <div className="distribution-grid">
            {Object.entries(geoDistribution).map(([country, count]) => (
              <div key={country} className="distribution-card">
                <div className="country-name">🌍 {country || 'Unknown'}</div>
                <div className="distribution-bar">
                  <div
                    className="bar-fill"
                    style={{ width: `${(count as number / totalClicks) * 100}%` }}
                  ></div>
                </div>
                <div className="distribution-count">{count as number} clicks</div>
              </div>
            ))}
          </div>
        </div>

        {/* Click Type Distribution */}
        <div className="distribution-section">
          <h3>Click Type Distribution</h3>
          <div className="click-types">
            {Object.entries(clickDistribution).map(([type, count]) => (
              <div key={type} className="type-badge">
                <span className="type-icon">
                  {type === 'external' ? '🔗' : type === 'internal' ? '📄' : '⚙️'}
                </span>
                <span className="type-name">{type}</span>
                <span className="type-count">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label>Filter by Country:</label>
            <select
              value={selectedCountry || ''}
              onChange={e => setSelectedCountry(e.target.value || null)}
            >
              <option value="">All Countries ({analyticsRecords.length})</option>
              {countries.map(country => (
                <option key={country} value={country}>
                  {country} ({geoDistribution[country]})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Click Type:</label>
            <select
              value={clickTypeFilter || ''}
              onChange={e => setClickTypeFilter(e.target.value || null)}
            >
              <option value="">All Types ({analyticsRecords.length})</option>
              {clickTypes.map(type => (
                <option key={type} value={type}>
                  {type} ({clickDistribution[type]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Analytics Records Table */}
        <div className="table-container">
          {loading ? (
            <div className="loading">Loading analytics data...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="no-data">No analytics records found</div>
          ) : (
            <table className="details-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Clicked At</th>
                  <th>Country/City</th>
                  <th>Type</th>
                  <th>Destination</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, idx) => (
                  <tr key={record.id}>
                    <td className="user-id">
                      <span className="user-badge">{record.userId.slice(0, 10)}...</span>
                    </td>
                    <td className="timestamp">
                      {record.clickedAt instanceof Date
                        ? record.clickedAt.toLocaleString()
                        : new Date(record.clickedAt).toLocaleString()}
                    </td>
                    <td className="location">
                      <div className="location-info">
                        {record.city && <span>{record.city}</span>}
                        {record.country && <span>{record.country}</span>}
                        {!record.city && !record.country && <span>-</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`click-badge ${record.clickType}`}>
                        {record.clickType === 'external' && '🔗 '}
                        {record.clickType === 'internal' && '📄 '}
                        {record.clickType === 'app_action' && '⚙️ '}
                        {record.clickType}
                      </span>
                    </td>
                    <td className="url-cell">
                      {record.clickUrl ? (
                        <a
                          href={record.clickUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="url-link"
                          title={record.clickUrl}
                        >
                          {record.clickUrl.slice(0, 40)}...
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="ip-address">{record.ipAddress || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 1200px;
            width: 95%;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            border-bottom: 2px solid #f0f0f0;
            padding-bottom: 15px;
          }

          .modal-header h2 {
            margin: 0;
            color: #333;
            font-size: 24px;
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            transition: color 0.2s;
          }

          .close-btn:hover {
            color: #333;
          }

          .analytics-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
          }

          .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .stat-card.primary {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          .stat-label {
            font-size: 12px;
            text-transform: uppercase;
            opacity: 0.9;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 28px;
            font-weight: bold;
          }

          .distribution-section {
            margin-bottom: 30px;
            padding-bottom: 25px;
            border-bottom: 1px solid #eee;
          }

          .distribution-section h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 16px;
            font-weight: 600;
          }

          .distribution-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }

          .distribution-card {
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 8px;
            background: #f9f9f9;
          }

          .country-name {
            margin-bottom: 10px;
            font-weight: 600;
            color: #333;
          }

          .distribution-bar {
            width: 100%;
            height: 20px;
            background: #eee;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 8px;
          }

          .bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
          }

          .distribution-count {
            font-size: 12px;
            color: #666;
          }

          .click-types {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }

          .type-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 15px;
            background: #f0f0f0;
            border-radius: 6px;
            border-left: 4px solid #667eea;
          }

          .type-icon {
            font-size: 16px;
          }

          .type-name {
            font-weight: 600;
            color: #333;
            text-transform: capitalize;
          }

          .type-count {
            margin-left: auto;
            background: #667eea;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }

          .filters {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
          }

          .filter-group {
            display: flex;
            flex-direction: column;
          }

          .filter-group label {
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
          }

          .filter-group select {
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
          }

          .table-container {
            overflow-x: auto;
            margin-top: 20px;
          }

          .details-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }

          .details-table thead {
            background: #f5f5f5;
          }

          .details-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #ddd;
          }

          .details-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }

          .details-table tbody tr:hover {
            background: #fafafa;
          }

          .user-id {
            font-family: monospace;
          }

          .user-badge {
            background: #e8eaf6;
            color: #3f51b5;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
          }

          .timestamp {
            font-size: 12px;
            color: #666;
            white-space: nowrap;
          }

          .location {
            font-size: 12px;
          }

          .location-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .location-info span {
            color: #666;
          }

          .click-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
          }

          .click-badge.external {
            background: #fff3e0;
            color: #f57c00;
          }

          .click-badge.internal {
            background: #e8f5e9;
            color: #4caf50;
          }

          .click-badge.app_action {
            background: #f3e5f5;
            color: #9c27b0;
          }

          .url-cell {
            max-width: 250px;
          }

          .url-link {
            color: #667eea;
            text-decoration: none;
            overflow: hidden;
            text-overflow: ellipsis;
            word-break: break-all;
            display: block;
          }

          .url-link:hover {
            text-decoration: underline;
          }

          .ip-address {
            font-family: monospace;
            font-size: 12px;
            color: #999;
          }

          .loading,
          .no-data {
            padding: 40px;
            text-align: center;
            color: #999;
            font-size: 16px;
          }
        `}</style>
      </div>
    </div>
  );
}
