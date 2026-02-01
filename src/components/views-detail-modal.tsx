'use client';

import { useState, useEffect } from 'react';
import { getFirestore } from '@/data/firebase.admin';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore as getClientFirestore } from 'firebase/firestore';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

/**
 * Modal component for displaying detailed view analytics
 */
export function ViewsDetailModal({
  isOpen,
  bannerId,
  onClose,
  totalViews,
  totalClicks,
  ctr,
}: {
  isOpen: boolean;
  bannerId: string;
  onClose: () => void;
  totalViews: number;
  totalClicks: number;
  ctr: number;
}) {
  const [viewRecords, setViewRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bannerId) {
      loadViewRecords();
    }
  }, [isOpen, bannerId]);

  const loadViewRecords = async () => {
    setLoading(true);
    try {
      // Check if we need to initialize Firebase
      if (typeof window !== 'undefined') {
        const apps = getApps();
        let db;

        if (apps.length === 0) {
          // Firebase not initialized, skip detailed loading
          console.warn('Firebase not initialized on client');
          setLoading(false);
          return;
        }

        db = getClientFirestore(apps[0]);

        const viewsRef = collection(db, 'banners', bannerId, 'views');
        const querySnapshot = await getDocs(query(viewsRef, orderBy('viewedAt', 'desc')));

        const records = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          viewedAt: doc.data().viewedAt?.toDate?.() || new Date(doc.data().viewedAt),
        }));

        setViewRecords(records);
      }
    } catch (error) {
      console.error('Error loading view records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const userViews = selectedUser
    ? viewRecords.filter(r => r.userId === selectedUser)
    : viewRecords;

  const uniqueUsers = Array.from(new Set(viewRecords.map(r => r.userId)));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Views Analytics</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Summary Stats */}
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-label">Total Views</span>
            <span className="stat-value">{totalViews}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Clicks</span>
            <span className="stat-value">{totalClicks}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">CTR</span>
            <span className="stat-value">{ctr}%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Unique Users</span>
            <span className="stat-value">{uniqueUsers.length}</span>
          </div>
        </div>

        {/* User Filter */}
        <div className="user-filter">
          <label>Filter by User:</label>
          <select
            value={selectedUser || ''}
            onChange={e => setSelectedUser(e.target.value || null)}
          >
            <option value="">All Users ({viewRecords.length} views)</option>
            {uniqueUsers.map(userId => {
              const userViewCount = viewRecords.filter(r => r.userId === userId).length;
              return (
                <option key={userId} value={userId}>
                  {userId.slice(0, 12)}... ({userViewCount} views)
                </option>
              );
            })}
          </select>
        </div>

        {/* View Records Table */}
        <div className="table-container">
          {loading ? (
            <div className="loading">Loading view data...</div>
          ) : userViews.length === 0 ? (
            <div className="no-data">No view records found</div>
          ) : (
            <table className="details-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Viewed At</th>
                  <th>Source</th>
                  <th>Index</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                {userViews.map((record, idx) => (
                  <tr key={record.id}>
                    <td className="user-id">{record.userId.slice(0, 16)}...</td>
                    <td className="timestamp">
                      {record.viewedAt instanceof Date
                        ? record.viewedAt.toLocaleString()
                        : new Date(record.viewedAt).toLocaleString()}
                    </td>
                    <td>{record.metadata?.source || '-'}</td>
                    <td className="center">{record.metadata?.carousel_index ?? '-'}</td>
                    <td className="device-info">
                      {record.userAgent?.includes('Mobile') ? '📱' : '💻'}
                    </td>
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
            max-width: 1000px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
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

          .stats-summary {
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

          .user-filter {
            margin-bottom: 20px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
          }

          .user-filter label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
          }

          .user-filter select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
          }

          .table-container {
            overflow-x: auto;
          }

          .details-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
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
            font-size: 12px;
            color: #666;
          }

          .timestamp {
            font-size: 13px;
            color: #666;
          }

          .center {
            text-align: center;
          }

          .device-info {
            text-align: center;
            font-size: 18px;
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
