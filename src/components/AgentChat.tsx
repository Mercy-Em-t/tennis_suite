'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { applicationLayer } from '@/lib/osi/ApplicationModule';
import { OsiError } from '@/lib/osi/types';

export function AgentChat({ playerId, tournamentId }: { playerId: string, tournamentId: string }) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'agent', text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = query.trim();
    setHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      // Use OSI Application Layer instead of direct fetch
      // For session_id, in a real app this would be extracted from an auth provider or cookie.
      // We pass a dummy 'auth_token' here which the Server Session module will validate.
      applicationLayer.sendMessage(
        { playerId, tournamentId, query: userMsg },
        playerId,
        'SUPPORT_AGENT',
        'auth_token_here',
        {
          on_success: (data) => {
            if (data && data.agentResponse) {
              setHistory(prev => [...prev, { role: 'agent', text: data.agentResponse.responseMessage }]);
            } else {
              setHistory(prev => [...prev, { role: 'agent', text: "Error: Unrecognized response format." }]);
            }
            setLoading(false);
          },
          on_failure: (error: OsiError) => {
            setHistory(prev => [...prev, { 
              role: 'agent', 
              text: `System Alert [${error.error_code}]: ${error.message} - ${error.suggested_action}` 
            }]);
            setLoading(false);
          }
        }
      );
    } catch (err) {
      setHistory(prev => [...prev, { role: 'agent', text: "Error: Unexpected application failure." }]);
      setLoading(false);
    }
  };

  return (
    <Card style={{ background: '#161b22', border: '1px solid #30363d', display: 'flex', flexDirection: 'column', height: '400px', overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #30363d', background: '#0d1117' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#7ee787' }}></span>
          Player Support Agent
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#8b949e', margin: '4px 0 0 0' }}>AI-Assisted Operations</p>
      </div>
      
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {history.length === 0 && (
          <div style={{ color: '#8b949e', textAlign: 'center', fontSize: '0.9rem', marginTop: 'auto', marginBottom: 'auto' }}>
            Ask about your schedule, rules, or report an issue.
          </div>
        )}
        {history.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{ 
              background: msg.role === 'user' ? '#1f6feb' : '#21262d', 
              color: '#c9d1d9',
              padding: '10px 14px', 
              borderRadius: '12px',
              borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
              borderBottomLeftRadius: msg.role === 'agent' ? '2px' : '12px',
              fontSize: '0.9rem',
              lineHeight: 1.4
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', color: '#8b949e', fontSize: '0.8rem', fontStyle: 'italic' }}>
            Agent is typing...
          </div>
        )}
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid #30363d', background: '#0d1117', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '8px 12px', background: '#010409', border: '1px solid #30363d', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
        />
        <Button onClick={handleSend} variant="primary" disabled={loading || !query.trim()}>
          Send
        </Button>
      </div>
    </Card>
  );
}
