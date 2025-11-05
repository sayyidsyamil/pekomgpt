'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import { useEvents, Event } from '../contexts/EventsContext';
import { getDepartmentColor } from '../utils/eventColors';
import EventEditModal from './EventEditModal';
import SemesterTimeline from './SemesterTimeline';
import { MapPinIcon, ClockIcon } from './icons';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7; // Sun->6, Mon->0, Tue->1, ...
  d.setDate(d.getDate() - diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEventsForDate(date: Date, allEvents: Event[]): Event[] {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  return allEvents.filter(event => {
    const start = new Date(event.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(event.endDate);
    end.setHours(0, 0, 0, 0);
    
    return dateOnly >= start && dateOnly <= end;
  });
}

const ACADEMIC_BASE_WEEK_START = new Date(2025, 9, 13); // Mon 13 Oct 2025
ACADEMIC_BASE_WEEK_START.setHours(0, 0, 0, 0);

function getAcademicWeekNumber(weekStart: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const start = getWeekStart(weekStart).getTime();
  const base = ACADEMIC_BASE_WEEK_START.getTime();
  const index = Math.floor((start - base) / msPerWeek);
  return index + 1; // Week 1-based
}

// Helpers for labeled academic periods/overrides
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map((v) => parseInt(v, 10));
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function isWithinRange(date: Date, startISO: string, endISO: string): boolean {
  const t = getWeekStart(date).getTime();
  const s = getWeekStart(parseISODateLocal(startISO)).getTime();
  const e = getWeekStart(parseISODateLocal(endISO)).getTime();
  return t >= s && t <= e;
}

function getWeekLabel(weekStart: Date): string | null {
  // Static labeled periods (Mon-based ranges)
  const labels: { start: string; end: string; label: string }[] = [
    // Semester I
    { start: '2025-10-06', end: '2025-10-12', label: 'Orientation (WOW)' },
    { start: '2025-10-13', end: '2025-10-19', label: 'Week 1' },
    { start: '2025-10-20', end: '2025-10-26', label: 'Week 2' },
    { start: '2025-10-27', end: '2025-11-02', label: 'Week 3' },
    { start: '2025-11-03', end: '2025-11-09', label: 'Week 4' },
    { start: '2025-11-10', end: '2025-11-16', label: 'Week 5' },
    { start: '2025-11-17', end: '2025-11-23', label: 'Week 6' },
    { start: '2025-11-24', end: '2025-11-30', label: 'Mid Semester I Break' },
    { start: '2025-12-01', end: '2025-12-07', label: 'Week 7' },
    { start: '2025-12-08', end: '2025-12-14', label: 'Week 8' },
    { start: '2025-12-15', end: '2025-12-21', label: 'Week 9' },
    { start: '2025-12-22', end: '2025-12-28', label: 'Week 10' },
    { start: '2025-12-29', end: '2026-01-04', label: 'Week 11' },
    { start: '2026-01-05', end: '2026-01-11', label: 'Week 12' },
    { start: '2026-01-12', end: '2026-01-18', label: 'Week 13' },
    { start: '2026-01-19', end: '2026-01-25', label: 'Week 14' },
    { start: '2026-01-26', end: '2026-02-01', label: 'Revision Week' },
    { start: '2026-02-02', end: '2026-02-22', label: 'Semester I Final Examination' },
    { start: '2026-02-23', end: '2026-03-08', label: 'Semester I Break' },

    // Semester II
    { start: '2026-03-09', end: '2026-03-15', label: 'Week 1 (Sem 2)' },
    { start: '2026-03-16', end: '2026-03-22', label: 'Week 2 (Sem 2)' },
    { start: '2026-03-23', end: '2026-03-29', label: 'Week 3 (Sem 2)' },
    { start: '2026-03-30', end: '2026-04-05', label: 'Week 4 (Sem 2)' },
    { start: '2026-04-06', end: '2026-04-12', label: 'Week 5 (Sem 2)' },
    { start: '2026-04-13', end: '2026-04-19', label: 'Week 6 (Sem 2)' },
    { start: '2026-04-20', end: '2026-04-26', label: 'Week 7 (Sem 2)' },
    { start: '2026-04-27', end: '2026-05-03', label: 'Mid Semester II Break' },
    { start: '2026-05-04', end: '2026-05-10', label: 'Week 8 (Sem 2)' },
    { start: '2026-05-11', end: '2026-05-17', label: 'Week 9 (Sem 2)' },
    { start: '2026-05-18', end: '2026-05-24', label: 'Week 10 (Sem 2)' },
    { start: '2026-05-25', end: '2026-05-31', label: 'Week 11 (Sem 2)' },
    { start: '2026-06-01', end: '2026-06-07', label: 'Week 12 (Sem 2)' },
    { start: '2026-06-08', end: '2026-06-14', label: 'Week 13 (Sem 2)' },
    { start: '2026-06-15', end: '2026-06-21', label: 'Week 14 (Sem 2)' },
    { start: '2026-06-22', end: '2026-06-28', label: 'Revision Week (Sem 2)' },
    { start: '2026-06-29', end: '2026-07-19', label: 'Semester II Final Examination' },
    { start: '2026-07-20', end: '2026-08-16', label: 'Semester II Break' },
  ];
  for (const item of labels) {
    if (isWithinRange(weekStart, item.start, item.end)) return item.label;
  }
  return null;
}

function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function formatTimeRange(start?: string, end?: string): string {
  if (start && end) return `${formatTime(start)} – ${formatTime(end)}`;
  if (start) return `${formatTime(start)}`;
  if (end) return `${formatTime(end)}`;
  return '';
}

export default function Calendar() {
  const ref = useRef<HTMLDivElement>(null);
  const { events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateISO, setSelectedDateISO] = useState<string | undefined>(undefined);

  type DayCell = {
    date: Date;
    day: number;
    name: string;
    month: number;
    year: number;
    isToday: boolean;
    events: Event[];
  };

  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = getWeekStart(today);
    const weeksData = [] as Array<{
      start: Date;
      days: DayCell[];
      isThisWeek: boolean;
      weekNumber: number;
      label: string | null;
    }>;

    // Generate weeks from current week until the end of academic year timeline
    const ACADEMIC_END = new Date(2026, 7, 16); // 16 Aug 2026
    ACADEMIC_END.setHours(0, 0, 0, 0);

    let cursor = new Date(weekStart);
    let idx = 0;
    while (cursor.getTime() <= ACADEMIC_END.getTime()) {
      const start = new Date(cursor);
      const days: DayCell[] = [];
      
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(date.getDate() + d);
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);
        const isToday = dateOnly.getTime() === today.getTime();
        
        const dayEvents = getEventsForDate(date, events);
        
        days.push({
          date,
          day: date.getDate(),
          name: DAYS_SHORT[date.getDay()],
          month: date.getMonth(),
          year: date.getFullYear(),
          isToday,
          events: dayEvents
        });
      }

      weeksData.push({
        start,
        days,
        isThisWeek: idx === 0,
        weekNumber: getAcademicWeekNumber(start),
        label: getWeekLabel(start)
      });
      // advance a week
      cursor.setDate(cursor.getDate() + 7);
      idx += 1;
    }

    return weeksData;
  }, [events]);

  useEffect(() => {
    if (ref.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  return (
    <>
      <div className="h-full overflow-y-auto">
        <div className="max-w-full mx-auto p-6">
          {/* Timeline */}
          <div className="mb-6"><SemesterTimeline /></div>
          {/* Single column layout for maximum readability */}
          <div className="space-y-6">
          {weeks.map((week, wi) => {
            return (
              <div
                key={wi}
                ref={week.isThisWeek ? ref : null}
                className={`rounded-xl border border-foreground/10 bg-background shadow-sm ${
                  week.isThisWeek ? 'ring-2 ring-foreground/20' : ''
                }`}
              >
                {/* Week Header */}
                <div className="px-6 py-4 border-b border-foreground/10">
                  <h3 className={`text-lg font-semibold ${week.isThisWeek ? 'text-foreground' : 'text-foreground/70'}`}>
                    {week.label ? (week.isThisWeek ? `This Week (${week.label})` : week.label) : (week.isThisWeek ? `This Week (Week ${week.weekNumber})` : `Week ${week.weekNumber}`)}
                  </h3>
                </div>

                {/* Days Grid */}
                <div className="p-4 md:p-6">
                  {/* Day headers */}
                  <div className="hidden lg:grid grid-cols-7 gap-4 mb-4">
                    {DAYS_SHORT.map((day, idx) => (
                      <div
                        key={idx}
                        className="text-sm text-center text-foreground/50 font-medium"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
                    {week.days.map((day, di) => {
                      return (
                        <div
                          key={di}
                          className={`min-h-[140px] md:min-h-[180px] lg:min-h-[200px] p-2 md:p-3 rounded-lg ${
                            day.isToday 
                              ? 'bg-foreground/10 ring-2 ring-foreground/30' 
                              : 'bg-foreground/5'
                          }`}
                        >
                          <div className={`text-sm md:text-base font-semibold mb-2 md:mb-3 ${
                            day.isToday ? 'text-foreground' : 'text-foreground/80'
                          }`}>
                            {day.day}
                          </div>
                          <div className="space-y-1.5 md:space-y-2">
                            {day.events.length === 0 ? (
                              <div className="text-xs md:text-sm text-foreground/30">No events</div>
                            ) : (
                              day.events.map((event) => {
                                const eventColors = getDepartmentColor(event.department || 'Execution');
                                // Resolve overrides for this specific day
                                const iso = day.date.toISOString().slice(0, 10);
                                const override = event.perDay?.[iso] || {};
                                const effectiveStart = override.startTime ?? event.startTime;
                                const effectiveEnd = override.endTime ?? event.endTime;
                                const effectiveLocation = override.location ?? event.location;
                                const effectiveDescription = override.description ?? event.description;
                                return (
                                  <div
                                    key={event.id}
                                    onClick={() => {
                                      setSelectedEvent(event);
                                      setSelectedDateISO(iso);
                                      setIsModalOpen(true);
                                    }}
                                    className={`text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2 rounded-md border-l-3 cursor-pointer hover:opacity-80 transition-opacity ${eventColors.bg} ${eventColors.border} ${eventColors.text}`}
                                    title={`${event.name} - ${event.department}${effectiveLocation ? ` - ${effectiveLocation}` : ''}${(effectiveStart || effectiveEnd) ? ` - ${formatTimeRange(effectiveStart, effectiveEnd)}` : ''}`}
                                  >
                                    <div className="leading-snug md:leading-relaxed wrap-break-word font-medium mb-0.5 md:mb-1">
                                      {event.name}
                                    </div>
                                    {(effectiveStart || effectiveEnd) && (
                                      <div className="flex items-center gap-1.5 text-[11px] md:text-xs opacity-80 mt-0.5 md:mt-1">
                                        <ClockIcon className="h-3 w-3" />
                                        <span>{formatTimeRange(effectiveStart, effectiveEnd)}</span>
                                      </div>
                                    )}
                                    {effectiveLocation && (
                                      <div className="flex items-center gap-1.5 text-[11px] md:text-xs opacity-70 mt-0.5">
                                        <MapPinIcon className="h-3 w-3" />
                                        <span className="truncate">{effectiveLocation}</span>
                                      </div>
                                    )}
                                    {effectiveDescription && (
                                      <div className="text-[11px] md:text-xs opacity-70 mt-0.5 wrap-break-word">
                                        {effectiveDescription}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
      
      {selectedEvent && (
        <EventEditModal
          event={selectedEvent}
          isOpen={isModalOpen}
          dateISO={selectedDateISO}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
            setSelectedDateISO(undefined);
          }}
        />
      )}
    </>
  );
}
