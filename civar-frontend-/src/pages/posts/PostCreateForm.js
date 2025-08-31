import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useApi } from '../../context/ApiContext';
import { useAuth } from '../../context/AuthContext';

export default function PostCreateForm(){
  const { client } = useApi();
  const { user } = useAuth();
  const qc = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async(values)=>{
      console.log('Post oluşturuluyor:', values);
      const res = await client.post('/post', values);
      console.log('Post oluşturuldu:', res.data);
      return res.data;
    },
    onSuccess: (data)=>{
      console.log('Post başarıyla oluşturuldu, cache temizleniyor...');
      
      
      qc.invalidateQueries({queryKey:['posts']});
      
      
      const neighborhoodId = user?.neighborhoodId || user?.neighborhoodID || user?.mahalleId || user?.mahalleID || user?.NeighborhoodId || user?.MahalleId;
      if (neighborhoodId) {
        console.log('neighborhoodId ile cache temizleniyor:', neighborhoodId);
        qc.invalidateQueries({queryKey:['posts', undefined, neighborhoodId]});
        qc.invalidateQueries({queryKey:['posts', 5, neighborhoodId]});
      }
      
      
      qc.setQueryData(['posts'], (oldData) => {
        if (oldData) {
          return [data, ...oldData];
        }
        return [data];
      });
      
      formik.resetForm();
      console.log('Cache başarıyla temizlendi ve güncellendi!');
    },
    onError: (error) => {
      console.error('Post oluşturma hatası:', error);
    }
  });
  
  const formik = useFormik({
    initialValues:{ title:'', content:'' },
    validationSchema: Yup.object({ title: Yup.string().required(), content: Yup.string().required()}),
    onSubmit: values => mutation.mutate(values)
  });
  
  return <div className="card" style={{maxWidth:700}}>
    <form onSubmit={formik.handleSubmit} className="flex-col gap-sm">
      <h3>Create Post</h3>
      <input name="title" placeholder="Title" value={formik.values.title} onChange={formik.handleChange} />
      <textarea name="content" rows={3} placeholder="What's happening?" value={formik.values.content} onChange={formik.handleChange} />
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <button type="submit" className="primary" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Paylaşılıyor...' : 'Post'}
        </button>
        {mutation.isError && <span style={{color:'crimson',fontSize:'.8rem'}}>Error</span>}
        {mutation.isSuccess && <span style={{color:'#0b6c3c',fontSize:'.8rem'}}>Posted</span>}
      </div>
    </form>
  </div>;
}
