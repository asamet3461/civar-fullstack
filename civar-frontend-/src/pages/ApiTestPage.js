import React, { useEffect, useState } from 'react';
import { fetchEndpoint } from '../utils/api';

export default function ApiTestPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchEndpoint()
      .then(d => { if (mounted) setData(d); })
      .catch(err => { if (mounted) setError(err); });
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>API Test</h2>
      {error && <pre style={{ color: 'crimson' }}>{String(error.message)}{error.body ? '\n' + JSON.stringify(error.body, null, 2) : ''}</pre>}
      {!error && !data && <div>Yükleniyor...</div>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
