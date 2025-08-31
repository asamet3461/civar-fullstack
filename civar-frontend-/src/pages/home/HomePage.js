import React from 'react';
import PostsList from '../posts/PostsList';
import EventsList from '../events/EventsList';

export default function HomePage(){
  return <div className="flex-col gap">
    <section>
      <h2>Latest Posts</h2>
      <PostsList limit={5} />
    </section>
    <section>
      <h2>Upcoming Events</h2>
      <EventsList limit={5} />
    </section>
  </div>;
}
