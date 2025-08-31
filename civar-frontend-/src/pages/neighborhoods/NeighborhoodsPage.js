import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../context/ApiContext';

export default function NeighborhoodsPage(){
  const { client } = useApi();
  const { data, isLoading, error } = useQuery({
    queryKey:['neighborhoods'],
    queryFn: async ()=> (await client.get('/neighborhood')).data
  });
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading neighborhoods</div>;
  return <div className="flex-col gap">
    <h2>Neighborhoods</h2>
    {data.map(n => <div className="card" key={n.id}>
      <strong>{n.name}</strong>
      {n.city && <span className="badge">{n.city}</span>}
      <div className="muted">Residents: {n.residentCount || n.userCount || '-'}</div>
    </div>)}
  </div>;
}
