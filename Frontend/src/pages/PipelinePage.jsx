import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios.js';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { showToast } from '../components/common/toast.js';

export default function PipelinePage() {
  const [runs, setRuns] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const pollIntervalRef = useRef(null);

  const fetchRuns = async () => {
    try {
      const res = await api.get('/api/pipeline-runs');
      setRuns(res.data);
    } catch (err) {
      console.error('Failed to fetch runs:', err);
    } finally {
      setLoadingRuns(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleRunNow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    try {
      const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;
      if (webhookUrl) {
        // Do not block on webhook response
        fetch(webhookUrl, { method: 'POST' }).catch(err => console.error('Webhook error:', err));
      } else {
        console.warn('VITE_MAKE_WEBHOOK_URL is not set.');
      }
      
      // Start polling
      pollIntervalRef.current = setInterval(async () => {
        try {
          const res = await api.get('/api/pipeline-runs/latest');
          const data = res.data;
          
          if (data && data.status === 'completed') {
            clearInterval(pollIntervalRef.current);
            setIsRunning(false);
            showToast(`Pipeline complete · +${data.leadsAdded || 0} leads added`);
            fetchRuns();
          } else if (data && data.status === 'failed') {
            clearInterval(pollIntervalRef.current);
            setIsRunning(false);
            showToast('Pipeline failed');
            fetchRuns();
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 5000);
    } catch (err) {
      console.error('Failed to trigger pipeline:', err);
      setIsRunning(false);
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '-';
    const s = new Date(start);
    const e = new Date(end);
    const diffInSeconds = Math.floor((e - s) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    return `${Math.floor(diffInSeconds / 60)}m ${diffInSeconds % 60}s`;
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 200, 150, 0.5); }
          50%       { opacity: 0.8; transform: scale(1.25); box-shadow: 0 0 0 5px rgba(0, 200, 150, 0); }
        }
        .pipeline-run-btn {
          background-color: var(--color-jade, #00C896);
          color: #fff;
          border: 1px solid var(--color-jade, #00C896);
          padding: 8px 16px;
          border-radius: 6px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .pipeline-run-btn:hover:not(:disabled) {
          opacity: 0.9;
        }
        .pipeline-run-btn:disabled {
          background-color: rgba(0, 200, 150, 0.15);
          color: var(--color-jade, #00C896);
          cursor: not-allowed;
        }
        .pulsing-dot {
          width: 8px;
          height: 8px;
          background-color: var(--color-jade, #00C896);
          border-radius: 50%;
          animation: pulse 2.4s ease-in-out infinite;
        }
        .pipeline-box {
          background: var(--color-surface-2);
          border: 1px solid var(--color-glass-border);
          border-radius: 8px;
          padding: 12px 16px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 13px;
          color: var(--color-text-primary);
          text-align: center;
          white-space: nowrap;
        }
        .pipeline-arrow {
          color: var(--color-jade, #00C896);
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 16px;
          margin: 0 8px;
        }
        .runs-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 16px;
          font-family: 'Inter', sans-serif;
        }
        .runs-table th {
          text-align: left;
          padding: 12px 16px;
          color: var(--color-text-muted);
          font-size: 12px;
          font-weight: 500;
          border-bottom: 1px solid var(--color-glass-border);
        }
        .runs-table td {
          padding: 16px;
          color: var(--color-text-primary);
          font-size: 14px;
          border-bottom: 1px solid var(--color-glass-border);
        }
      `}</style>

      {/* Top Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div>
          <h1 style={{ 
            fontFamily: "'Plus Jakarta Sans', sans-serif", 
            fontWeight: 700, 
            fontSize: '28px', 
            color: 'var(--color-text-primary)', 
            margin: '0 0 8px 0' 
          }}>
            Pipeline
          </h1>
          <div style={{ 
            fontFamily: "'Inter', sans-serif", 
            fontWeight: 400, 
            fontSize: '14px', 
            color: 'var(--color-text-muted)' 
          }}>
            Automated lead generation · Tavily + Hunter + Groq
          </div>
        </div>
        
        <button 
          className="pipeline-run-btn"
          onClick={handleRunNow}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <div className="pulsing-dot"></div>
              Running...
            </>
          ) : (
            'Run Now'
          )}
        </button>
      </div>

      {/* Pipeline Steps Diagram */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '64px', overflowX: 'auto', paddingBottom: '8px' }}>
        <div className="pipeline-box">Tavily Search</div>
        <div className="pipeline-arrow">→</div>
        <div className="pipeline-box">Hunter Email</div>
        <div className="pipeline-arrow">→</div>
        <div className="pipeline-box">Groq Blurb</div>
        <div className="pipeline-arrow">→</div>
        <div className="pipeline-box">Dedupe Filter</div>
        <div className="pipeline-arrow">→</div>
        <div className="pipeline-box">Dashboard</div>
      </div>

      {/* Run History */}
      <div>
        <h2 style={{ 
          fontFamily: "'Inter', sans-serif", 
          fontWeight: 600, 
          fontSize: '16px', 
          color: 'var(--color-text-primary)', 
          margin: '0 0 16px 0' 
        }}>
          Recent Runs
        </h2>

        {loadingRuns ? (
          <div style={{ color: 'var(--color-text-muted, #A0A8BC)', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
            Loading runs...
          </div>
        ) : runs.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted, #A0A8BC)', fontFamily: "'Inter', sans-serif", fontSize: '14px' }}>
            No pipeline runs yet. Click Run Now to start.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="runs-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Leads Added</th>
                  <th>Status</th>
                  <th>Triggered By</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run._id || run.id}>
                    <td>{new Date(run.startedAt || run.createdAt).toLocaleString()}</td>
                    <td>{run.leadsAdded !== undefined ? `+${run.leadsAdded}` : '-'}</td>
                    <td>
                      <StatusBadge status={run.status} />
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{run.triggeredBy || 'System'}</td>
                    <td>{calculateDuration(run.startedAt || run.createdAt, run.completedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
