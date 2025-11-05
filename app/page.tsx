'use client';

import Calendar from './components/Calendar';
import EventForm from './components/EventForm';
import EventsList from './components/EventsList';
import { EventsProvider, useEvents } from './contexts/EventsContext';

function HomeContent() {
  const { addEvent } = useEvents();

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      {/* Left Panel - compact responsive widths */}
      <div className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 shrink-0">
        <div className="h-full p-4 md:p-5 overflow-y-auto">
          <EventForm onAddEvent={addEvent} />
          <EventsList />
        </div>
      </div>

      {/* Right Panel - fills remaining space */}
      <div className="w-full md:flex-1 overflow-hidden">
        <Calendar />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <EventsProvider>
      <HomeContent />
    </EventsProvider>
  );
}
