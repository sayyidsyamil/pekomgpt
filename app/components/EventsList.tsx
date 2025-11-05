'use client';

import { useEvents } from '../contexts/EventsContext';
import { useMemo, useState } from 'react';
import { getDepartmentColor } from '../utils/eventColors';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function EventsList() {
  const { events, deleteEvent } = useEvents();
  const [showPastEvents, setShowPastEvents] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { pastEvents, upcomingEvents, sortedEvents } = useMemo(() => {
    const past: typeof events = [];
    const upcoming: typeof events = [];

    events.forEach(event => {
      const endDate = new Date(event.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      if (endDate < today) {
        past.push(event);
      } else {
        upcoming.push(event);
      }
    });

    const all = showPastEvents ? [...past, ...upcoming] : upcoming;
    
    const sorted = all.sort((a, b) => {
      const dateA = a.startDate.getTime();
      const dateB = b.startDate.getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      return a.name.localeCompare(b.name);
    });

    return { pastEvents: past, upcomingEvents: upcoming, sortedEvents: sorted };
  }, [events, showPastEvents, today]);

  const displayedEvents = showPastEvents ? sortedEvents : upcomingEvents;

  if (events.length === 0) {
    return (
      <div className="mt-8 pt-8 border-t border-foreground/10">
        <h3 className="text-sm font-medium uppercase tracking-wider text-foreground/50 mb-4">
          All Events
        </h3>
        <div className="text-xs text-foreground/30 italic">No events yet</div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-foreground/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium uppercase tracking-wider text-foreground/50">
          All Events ({displayedEvents.length}{pastEvents.length > 0 && !showPastEvents ? ` + ${pastEvents.length} past` : ''})
        </h3>
        {pastEvents.length > 0 && (
          <button
            onClick={() => setShowPastEvents(!showPastEvents)}
            className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors"
          >
            {showPastEvents ? 'Hide' : 'Show'} Past
          </button>
        )}
      </div>
      <div className="space-y-2">
        {displayedEvents.length === 0 ? (
          <div className="text-xs text-foreground/30 italic">No events</div>
        ) : (
          displayedEvents.map((event) => {
            const isPast = event.endDate < today;
            const isSingleDay = event.startDate.getTime() === event.endDate.getTime();
            const dateStr = isSingleDay
              ? formatDate(event.startDate)
              : `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;
            
            const colors = getDepartmentColor(event.department);

            return (
              <div
                key={event.id}
                className={`group p-3 rounded-sm border-l-2 transition-colors ${
                  isPast 
                    ? `${colors.bg} ${colors.border} opacity-60` 
                    : `${colors.bg} ${colors.border} hover:opacity-80`
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium mb-1 line-clamp-2 ${colors.text}`}>
                      {event.name}
                    </div>
                    <div className="text-xs text-foreground/50 mb-1">{dateStr}</div>
                    <div className={`text-xs font-medium ${colors.text} opacity-70`}>{event.department}</div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-foreground/40 hover:text-foreground/70 px-2 py-1"
                    title="Delete event"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

