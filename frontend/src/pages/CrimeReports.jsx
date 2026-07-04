import { useEffect, useState } from 'react';
import { crimeReportsAPI } from '../services/api';
import { formatDate } from '../utils/helpers';

export default function CrimeReports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReports = async (query = '') => {
    setLoading(true);
    try {
      const { data } = await crimeReportsAPI.getAll(query || undefined);
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="crime-reports-page">
      <div className="page-header">
        <h2>Crime Reports</h2>
        <p>Browse recent crime reports from the community and official sources</p>
      </div>

      <div className="search-bar card">
        <input
          type="text"
          placeholder="Search by crime type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadReports(search)}
        />
        <button className="btn btn-primary" onClick={() => loadReports(search)}>
          Search
        </button>
        <button className="btn btn-secondary" onClick={() => { setSearch(''); loadReports(); }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-inline"><div className="spinner" /></div>
      ) : reports.length === 0 ? (
        <div className="empty-state card"><p>No crime reports found.</p></div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report.ReportID} className="report-card card">
              <div className="report-type">{report.CrimeType}</div>
              <p>{report.Description}</p>
              <div className="report-meta">
                <small>{formatDate(report.DateTime)}</small>
                <span className="source-badge">{report.Source}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
