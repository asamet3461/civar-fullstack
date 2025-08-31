import React from 'react';
import { Link } from 'react-router-dom';
export default function NotFoundPage(){
  return <div style={{padding:'3rem',textAlign:'center'}}>
    <h2>404 - Not Found</h2>
    <p>Page not found.</p>
    <Link to="/">Go Home</Link>
  </div>;
}
