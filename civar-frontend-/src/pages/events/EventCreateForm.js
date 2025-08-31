import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';
export default function EventCreateForm() {
  const { client } = useApi();
  const { user } = useAuth();
  
  console.log('EventCreateForm user:', user);
  const qc = useQueryClient();
  
  const neighborhoodId = user?.neighborhoodId || user?.neighborhoodID || user?.mahalleId || user?.mahalleID || user?.NeighborhoodId || user?.MahalleId || user?.neighborhood?.id || user?.mahalle?.id;
  const [neighborhoodName, setNeighborhoodName] = useState('');

  useEffect(() => {
    if (!neighborhoodId || !client) {
      setNeighborhoodName('');
      return;
    }
    client.get(`/neighborhood/${neighborhoodId}`)
      .then(res => {
        setNeighborhoodName(res.data.neighbourhood || res.data.name || '');
      })
      .catch(() => setNeighborhoodName(''));
  }, [neighborhoodId, client]);

  const mutation = useMutation({
    mutationFn: async(values)=> (await client.post(`/event?userId=${user?.id || user?.userId}`, values)).data,
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:['events']}); formik.resetForm(); }
  });

  const formik = useFormik({
    initialValues:{ title:'', description:'', startTime:'', endTime:'', location:'', neighborhoodId: neighborhoodId || '' },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().required('Başlık gerekli'),
      description: Yup.string().required('Açıklama gerekli'),
      startTime: Yup.string().required('Başlangıç zamanı gerekli'),
      endTime: Yup.string().required('Bitiş zamanı gerekli'),
      neighborhoodId: Yup.string().required('Mahalle seçimi gerekli')
    }),
    onSubmit: values => {
      const toUtcIso = (v) => v ? new Date(v).toISOString() : '';
      const payload = {
        title: values.title,
        description: values.description,
        startTime: toUtcIso(values.startTime),
        endTime: toUtcIso(values.endTime),
        location: values.location,
        neighborhoodId: neighborhoodId?.toString(),
      };
      mutation.mutate(payload);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="flex-col gap-sm">
      <h3>Etkinlik Oluştur</h3>
      <input name="title" placeholder="Başlık" value={formik.values.title} onChange={formik.handleChange} />
      <textarea name="description" rows={3} placeholder="Açıklama" value={formik.values.description} onChange={formik.handleChange} />
      <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:8}}>
        <label style={{fontWeight:600, fontSize:'.97rem', marginBottom:2}}>Başlangıç Tarihi</label>
        <input name="startTime" type="datetime-local" value={formik.values.startTime} onChange={formik.handleChange}
          style={{
            minWidth:0,
            width:'100%',
            padding:'7px 8px',
            borderRadius:6,
            border:'1px solid #eaf6ef',
            fontSize:'.97rem',
            boxSizing:'border-box',
            overflow:'hidden',
            marginBottom:6
          }} />
        <label style={{fontWeight:600, fontSize:'.97rem', marginBottom:2}}>Bitiş Tarihi</label>
        <input name="endTime" type="datetime-local" value={formik.values.endTime} onChange={formik.handleChange}
          style={{
            minWidth:0,
            width:'100%',
            padding:'7px 8px',
            borderRadius:6,
            border:'1px solid #eaf6ef',
            fontSize:'.97rem',
            boxSizing:'border-box',
            overflow:'hidden'
          }} />
      </div>
      <div className="row" style={{display:'grid', gridTemplateColumns: neighborhoodName ? '1fr 1fr' : '1fr', gap:16, marginBottom:8}}>
        <input name="location" placeholder="Konum" value={formik.values.location} onChange={formik.handleChange}
          style={{minWidth:0, width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid #eaf6ef', fontSize:'1rem'}} />
        {neighborhoodName && (
          <div style={{
            minWidth:0,
            width:'100%',
            padding:'10px 14px',
            borderRadius:8,
            border:'1px solid #eaf6ef',
            fontSize:'1rem',
            background:'#f5f5f5',
            color:'#179c5a',
            fontWeight:600,
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            letterSpacing:'.02em'
          }}>
            {neighborhoodName}
          </div>
        )}
      </div>
      <div className="actions">
        <button type="submit" className="primary" disabled={mutation.isLoading}>Oluştur</button>
        {mutation.isError && <span style={{color:'crimson',fontSize:'.85rem'}}>Hata</span>}
        {mutation.isSuccess && <span style={{color:'#0b6c3c',fontSize:'.85rem'}}>Kaydedildi</span>}
      </div>
    </form>
  );
}
