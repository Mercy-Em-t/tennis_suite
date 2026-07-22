'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CsvImportGuide() {
  const downloadTemplate = () => {
    const csvContent = "Team Name,Player 1 Name,Player 1 Email,Player 2 Name,Player 2 Email,Category\nTeam Alpha,John Doe,john@example.com,Jane Doe,jane@example.com,Open\nSolo Ranger,Jim Smith,jim@example.com,,,Singles";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'roster_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', color: '#c9d1d9' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ color: '#fff', fontSize: '2.5rem', margin: '0 0 16px', fontWeight: 800 }}>CSV Roster Ingestion Guide</h1>
        <p style={{ fontSize: '1.1rem', color: '#8b949e', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Learn how to properly format your CSV file for bulk roster uploads. Avoid errors and save time with our ready-made template.
        </p>
      </div>

      <Card style={{ background: '#161b22', padding: '40px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: '0 0 8px' }}>Download the Official Template</h2>
            <p style={{ color: '#8b949e', margin: 0, fontSize: '0.95rem' }}>Start with a pre-formatted file to guarantee a successful upload.</p>
          </div>
          <Button variant="primary" onClick={downloadTemplate}>
            Download Template.csv
          </Button>
        </div>

        <h3 style={{ color: '#58a6ff', fontSize: '1.2rem', marginBottom: '16px' }}>Column Requirements</h3>
        
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', marginBottom: '32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th style={{ padding: '16px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Column Header</th>
                <th style={{ padding: '16px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Requirement</th>
                <th style={{ padding: '16px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><code style={{ color: '#ff7b72', background: 'rgba(255,123,114,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Team Name</code></td>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: '#ff7b72', fontWeight: 600 }}>Required</span></td>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#8b949e' }}>The name of the franchise or team.</td>
              </tr>
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><code style={{ color: '#ff7b72', background: 'rgba(255,123,114,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Player 1 Name</code></td>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: '#ff7b72', fontWeight: 600 }}>Required</span></td>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#8b949e' }}>Full name of the primary player.</td>
              </tr>
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><code style={{ color: '#ff7b72', background: 'rgba(255,123,114,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Player 1 Email</code></td>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: '#ff7b72', fontWeight: 600 }}>Required</span></td>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#8b949e' }}>Valid email address for the primary player.</td>
              </tr>
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><code style={{ color: '#58a6ff', background: 'rgba(88,166,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Player 2 Name</code></td>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: '#8b949e' }}>Optional</span></td>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#8b949e' }}>Full name of the secondary player (for doubles).</td>
              </tr>
              <tr>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><code style={{ color: '#58a6ff', background: 'rgba(88,166,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Player 2 Email</code></td>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><span style={{ color: '#8b949e' }}>Optional</span></td>
                <td style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#8b949e' }}>Valid email address for the secondary player.</td>
              </tr>
              <tr>
                <td style={{ padding: '16px' }}><code style={{ color: '#58a6ff', background: 'rgba(88,166,255,0.1)', padding: '4px 8px', borderRadius: '4px' }}>Category</code></td>
                <td style={{ padding: '16px' }}><span style={{ color: '#8b949e' }}>Optional</span></td>
                <td style={{ padding: '16px', color: '#8b949e' }}>Division/Category. Defaults to "Open" if left blank.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ color: '#58a6ff', fontSize: '1.2rem', marginBottom: '16px' }}>Pro Tips for Success</h3>
        <ul style={{ color: '#8b949e', lineHeight: 1.6, margin: 0, paddingLeft: '20px', fontSize: '0.95rem' }}>
          <li style={{ marginBottom: '8px' }}>Ensure column headers exactly match the template (case-sensitive).</li>
          <li style={{ marginBottom: '8px' }}>Save your file as <strong>CSV (Comma delimited) (*.csv)</strong>. Avoid saving as Excel workbooks (.xlsx) or Numbers formats.</li>
          <li style={{ marginBottom: '8px' }}>Check for trailing commas or empty rows at the end of the file which might cause ghost entries.</li>
          <li style={{ marginBottom: '8px' }}>Use the exact same emails as the users' Tennis Suite accounts if they want to access their player dashboard later.</li>
        </ul>
      </Card>

      <div style={{ textAlign: 'center' }}>
        <Button variant="secondary" onClick={() => window.close()}>
          Close Guide & Return
        </Button>
      </div>
    </div>
  );
}
