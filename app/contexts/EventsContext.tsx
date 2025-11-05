'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Event {
  id: string;
  startDate: Date;
  endDate: Date;
  name: string;
  department?: string;
  isPublicHoliday?: boolean;
  location?: string;
  startTime?: string; // HH:MM (24h)
  endTime?: string;   // HH:MM (24h)
  description?: string;
  // Per-day overrides keyed by ISO date (YYYY-MM-DD)
  perDay?: Record<string, {
    location?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
  }>;
}

interface EventsContextType {
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);

  const normalizeDepartment = (dept?: string) => (dept === 'Collaboration' ? 'A&W' : dept);

  // Load events from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('pekom-events');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const eventsWithDates = parsed.map((e: any) => {
          const isPublicHoliday = e.department === 'Public Holiday';
          return {
            ...e,
            startDate: new Date(e.startDate),
            endDate: new Date(e.endDate),
            department: isPublicHoliday ? undefined : normalizeDepartment(e.department),
            isPublicHoliday,
          };
        });
        setEvents(eventsWithDates);
      } catch (e) {
        console.error('Failed to load events:', e);
      }
    } else {
      // Load initial events from provided data
      const initialEvents = parseInitialEvents().map((e) => ({
        ...e,
        isPublicHoliday: e.department === 'Public Holiday',
        department: e.department === 'Public Holiday' ? undefined : normalizeDepartment(e.department),
      }));
      setEvents(initialEvents);
      localStorage.setItem('pekom-events', JSON.stringify(initialEvents));
    }
  }, []);

  // Save to localStorage whenever events change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('pekom-events', JSON.stringify(events));
    }
  }, [events]);

  const addEvent = (event: Event) => {
    setEvents((prev) => [...prev, { ...event, isPublicHoliday: false, department: normalizeDepartment(event.department) }]);
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}

function parseInitialEvents(): Event[] {
  const data = `17-Sep-2025	24-Sep-2025	[RECRUIT] 1st Dean's Cup 2025	Event Prep
7-Oct-2025	7-Oct-2025	PEKOM Day	Internal
8-Oct-2025	12-Oct-2025	[RECRUIT]  2nd Dean's Cup 2025	Event Prep
20-Oct-2025	20-Oct-2025	Deepavali	Public Holiday
30-Oct-2025	30-Oct-2025	Etiqa Industrial Visit	SPR
31-Oct-2025	31-Oct-2025	ANT Industrial Visit	SPR
3-Nov-2025	9-Nov-2025	Mental Health Week	A&W
18-Dec-2025	18-Dec-2025	Charts That Talk: Data Visualization and Storytelling (Workshop)	Execution
7-Nov-2025	7-Nov-2025	Mastering Git & GitHub - ONLINE	Execution
8-Nov-2025	8-Nov-2025	Hack the Shell: Linux Kickstart	Execution
8-Jan-2026	8-Jan-2026	Game Development Workshop	Execution
14-Nov-2025	14-Nov-2025	Axrail Industrial Visit	SPR
15-Nov-2025	15-Nov-2025	Cyber Skill Level-Up (Workshop)	Execution
20-Nov-2025	20-Nov-2025	Build & Break: Information Systems 101	Execution
18-Dec-2025	18-Dec-2025	AI Agents in Action	Execution
24-Nov-2025	30-Nov-2025	Code Fest	A&W
5-Dec-2025	14-Dec-2025	Dean's Cup 2025	Flagship
25-Dec-2025	25-Dec-2025	Christmas	Public Holiday
1-Jan-2026	1-Jan-2026	New Year	Public Holiday
19-Dec-2025	21-Dec-2025	UM Startup Investor Challenge	Flagship
1-Feb-2026	1-Feb-2026	Thaipusam	Public Holiday
1-Feb-2026	1-Feb-2026	Federal Territory Day	Public Holiday
17-Feb-2026	18-Feb-2026	Chinese New Year	Public Holiday
7-Mar-2026	7-Mar-2026	Nuzul Al-Quran	Public Holiday
20-Mar-2026	21-Mar-2026	Eidul Fitri	Public Holiday
29-Mar-2026	29-Mar-2026	Design Duel 2026	Flagship
3-Apr-2026	4-Apr-2026	UMHackathon 2026	Flagship
8-Apr-2026	8-Apr-2026	Unlocking the Web: Obtaining Data from the Web and APIs (Workshop)	Execution
10-Apr-2026	11-Apr-2026	PEKOM Escape Room	A&W
9-Jan-2026	11-Jan-2026	Game Jam	Flagship
1-May-2026	1-May-2026	Labour Day	Public Holiday
2-May-2026	3-May-2026	UM Cybersecurity Summit	Flagship
14-May-2026	15-May-2026	MyTech Career Fair	Flagship
27-May-2026	27-May-2026	Eidul Adha	Public Holiday
31-May-2026	31-May-2026	Wesak Day	Public Holiday
1-Jun-2026	1-Jun-2026	His Majesty the King's Birthday	Public Holiday
4-Jun-2026	4-Jun-2026	AGM PEKOM	Internal
5-Jun-2026	5-Jun-2026	Dinner PEKOM	Internal
16-Jun-2026	16-Jun-2026	Awal Muharram	Public Holiday
29-Oct-2025	30-Oct-2025	WorldQuant Alphathon	Collaboration
25-Oct-2025	25-Oct-2025	Skilo Workshop	Collaboration
16-Nov-2025	16-Nov-2025	Share Your Love	A&W
14-Nov-2025	14-Nov-2025	[DRY RUN] Cyber Skill Level-Up (Workshop) - CUBE	Event Prep
24-Sep-2025	1-Oct-2025	[RECRUIT] UM Hackathon 2026	Event Prep
12-Sep-2025	16-Sep-2025	[RECRUIT] Mental Health Week 2025	Event Prep
6-Nov-2025	6-Nov-2025	[DRY RUN] Mental Health Week 2025	Event Prep
2-Oct-2025	7-Oct-2025	[RECRUIT] Code Fest 2025	Event Prep
17-Nov-2025	17-Nov-2025	[DRY RUN] Code Fest 2025	Event Prep
7-Oct-2025	19-Oct-2025	[RECRUIT]  Freshies Internal Committee	Event Prep
13-Dec-2025	13-Dec-2025	bday afzal	Internal
26-Oct-2025	26-Oct-2025	Mental Health Week Blasting	A&W`;

  const events: Event[] = [];
  const lines = data.split('\n').filter(line => line.trim());

  for (const line of lines) {
    const parts = line.split('\t').filter(p => p.trim());
    if (parts.length >= 3) {
      const startStr = parts[0].trim();
      const endStr = parts[1].trim();
      const name = parts[2].trim();
      const department = parts[3]?.trim() || 'Event Prep';

      if (startStr && endStr && name) {
        try {
          const startDate = parseDate(startStr);
          const endDate = parseDate(endStr);
          
          if (startDate && endDate) {
            events.push({
              id: `${startDate.getTime()}-${name}`,
              startDate,
              endDate,
              name,
              department,
            });
          }
        } catch (e) {
          console.error('Failed to parse date:', e);
        }
      }
    }
  }

  return events;
}

function parseDate(dateStr: string): Date | null {
  // Format: DD-MMM-YYYY (e.g., 17-Sep-2025)
  const months: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const year = parseInt(parts[2], 10);
    const month = months[monthStr];
    
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
}

