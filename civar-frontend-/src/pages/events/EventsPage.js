import './EventsPage.css';
import React from 'react';
import EventsList from './EventsList';
import EventCreateForm from './EventCreateForm';

export default function EventsPage(){
  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Etkinlikler</h1>
        <div className="subtitle">Mahallendeki etkinlikleri keşfet ve yenisini oluştur.</div>
      </div>
      <div className="events-grid">
        <div className="card events-form">
          <EventCreateForm />
        </div>
        <div className="card">
          <EventsList />
        </div>
      </div>
    </div>
  );
}
