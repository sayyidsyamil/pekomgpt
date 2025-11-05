'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useEvents, Event } from '../contexts/EventsContext';
import { getDepartmentColor } from '../utils/eventColors';
import { DownloadIcon } from './icons';

type SemesterKey = 'sem1' | 'sem2';

const SEM1_START = new Date(2025, 9, 13); // 13 Oct 2025
const SEM1_END = new Date(2026, 1, 22);   // 22 Feb 2026 (end exams)
const SEM2_START = new Date(2026, 2, 9);  // 09 Mar 2026
const SEM2_END = new Date(2026, 6, 19);   // 19 Jul 2026 (end exams)

const TRACK_DEPARTMENTS = new Set(['SPR', 'A&W', 'Execution', 'Flagship']);

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
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
  const labels: { start: string; end: string; label: string }[] = [
    // Semester I
    { start: '2025-10-06', end: '2025-10-12', label: 'Orientation (WOW)' },
    { start: '2025-10-13', end: '2025-10-19', label: 'Week 1' },
    { start: '2025-10-20', end: '2025-10-26', label: 'Week 2' },
    { start: '2025-10-27', end: '2025-11-02', label: 'Week 3' },
    { start: '2025-11-03', end: '2025-11-09', label: 'Week 4' },
    { start: '2025-11-10', end: '2025-11-16', label: 'Week 5' },
    { start: '2025-11-17', end: '2025-11-23', label: 'Week 6' },
    { start: '2025-11-24', end: '2025-11-30', label: 'Midsem Break' },
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
    { start: '2026-04-27', end: '2026-05-03', label: 'Midsem Break' },
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

function getRangeForSemester(key: SemesterKey) {
  return key === 'sem1'
    ? { start: SEM1_START, end: SEM1_END, title: 'Sem 1' }
    : { start: SEM2_START, end: SEM2_END, title: 'Sem 2' };
}

function useSemesterEvents(all: Event[], sem: SemesterKey) {
  const { start, end } = getRangeForSemester(sem);
  return useMemo(() => {
    return all
      .filter((e) => !e.isPublicHoliday && e.department && TRACK_DEPARTMENTS.has(e.department))
      .filter((e) => {
        const eStart = new Date(e.startDate);
        const eEnd = new Date(e.endDate);
        return (eStart >= start && eStart <= end) || 
               (eEnd >= start && eEnd <= end) || 
               (eStart <= start && eEnd >= end);
      });
  }, [all, start, end]);
}

function inRange(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t >= start.getTime() && t <= end.getTime();
}

export default function SemesterTimeline() {
  const { events } = useEvents();
  const [sem, setSem] = useState<SemesterKey>('sem1');
  const { start, end, title } = getRangeForSemester(sem);
  const [nowLeft, setNowLeft] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const list = useSemesterEvents(events, sem);

  const counts = useMemo(() => {
    const tally: Record<string, number> = { 'SPR': 0, 'A&W': 0, 'Execution': 0, 'Flagship': 0 };
    for (const e of list) {
      if (e.department && e.department in tally) tally[e.department] += 1;
    }
    return tally;
  }, [list]);

  // Build weeks array
  const weeks = useMemo(() => {
    const weeksData: Array<{ start: Date; end: Date; label: string | null; weekNum: number; isSpecial: boolean }> = [];
    let cur = getWeekStart(start);
    let weekNum = 1;
    
    while (cur.getTime() <= end.getTime()) {
      const weekStart = new Date(cur);
      const weekEnd = new Date(cur);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const label = getWeekLabel(weekStart);
      const isSpecial = label?.includes('Break') || label?.includes('Revision') || label?.includes('Examination') || false;
      
      // Extract week number from label if it's a regular week
      let displayWeekNum = weekNum;
      if (label && /Week (\d+)/.test(label)) {
        const match = label.match(/Week (\d+)/);
        if (match) displayWeekNum = parseInt(match[1], 10);
      } else if (!isSpecial) {
        displayWeekNum = weekNum;
      }
      
      weeksData.push({
        start: weekStart,
        end: weekEnd,
        label,
        weekNum: displayWeekNum,
        isSpecial,
      });
      
      cur.setDate(cur.getDate() + 7);
      if (!isSpecial) weekNum++;
    }
    
    return weeksData;
  }, [start, end]);

  // Calculate "Now" position client-side only to avoid hydration error
  useEffect(() => {
    const now = new Date();
    if (now >= start && now <= end) {
      const pct = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
      const calculatedWidth = Math.max(weeks.length * 180, 1000);
      setNowLeft(pct * calculatedWidth);
    } else {
      setNowLeft(null);
    }
  }, [start, end, weeks.length]);

  // Get events for each week
  const weekEvents = useMemo(() => {
    return weeks.map((week) => {
      return list.filter((event) => {
        const eStart = new Date(event.startDate);
        const eEnd = new Date(event.endDate);
        return inRange(eStart, week.start, week.end) || 
               inRange(eEnd, week.start, week.end) ||
               (eStart <= week.start && eEnd >= week.end);
      });
    });
  }, [weeks, list]);

  // Color mapping - match the image colors
  const deptColorMap: Record<string, string> = {
    'SPR': '#10b981',      // Green (Industrial Visit)
    'A&W': '#f59e0b',      // Yellow (Workshops)
    'Execution': '#6366f1', // Blue (Non Flagship Events)
    'Flagship': '#ef4444',  // Red (Flagship Events)
  };

  const weekWidth = 180; // pixels per week
  const containerWidth = Math.max(weeks.length * weekWidth, 1000);
  const eventContainerWidth = 160; // Width for events

  // Calculate dynamic height based on maximum events in any week
  const maxEventsInWeek = useMemo(() => {
    return Math.max(...weekEvents.map(events => events.length), 0);
  }, [weekEvents]);

  // Base height: timeline (80px) + week label (40px) + spacing (20px) + events
  // Each event takes ~34px (text + padding + spacing)
  const eventListHeight = maxEventsInWeek * 34; // 34px per event with spacing
  const dynamicHeight = Math.max(200, 140 + eventListHeight + 40); // base + events + padding

  // Download as SVG function
  const handleDownloadSVG = () => {
    if (!timelineRef.current) return;

    const padding = 40;
    const svgWidth = containerWidth + padding * 2;
    const svgHeight = dynamicHeight + padding * 2;
    
    // Create SVG element with padding
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(svgWidth));
    svg.setAttribute('height', String(svgHeight));
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    
    // Background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', '#ffffff');
    svg.appendChild(bg);
    
    // Create group for timeline content
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${padding}, ${padding})`);
    
    // Rail
    const rail = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rail.setAttribute('x1', '0');
    rail.setAttribute('y1', '80');
    rail.setAttribute('x2', String(containerWidth));
    rail.setAttribute('y2', '80');
    rail.setAttribute('stroke', '#171717');
    rail.setAttribute('stroke-width', '4');
    g.appendChild(rail);
    
    // Special periods - find consecutive spans
    const specialSpans: Array<{ startIdx: number; endIdx: number; label: string }> = [];
    let currentSpan: { startIdx: number; label: string } | null = null;
    
    weeks.forEach((week, i) => {
      if (week.isSpecial && week.label) {
        if (!currentSpan) {
          currentSpan = { startIdx: i, label: week.label };
        }
      } else {
        if (currentSpan) {
          specialSpans.push({ startIdx: currentSpan.startIdx, label: currentSpan.label, endIdx: i - 1 });
          currentSpan = null;
        }
      }
    });
    if (currentSpan) {
      const span = currentSpan as { startIdx: number; label: string };
      specialSpans.push({ startIdx: span.startIdx, label: span.label, endIdx: weeks.length - 1 });
    }
    
    specialSpans.forEach((span) => {
      const spanLeft = span.startIdx * weekWidth;
      const spanWidth = (span.endIdx - span.startIdx + 1) * weekWidth;
      
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(spanLeft));
      rect.setAttribute('y', '72');
      rect.setAttribute('width', String(spanWidth));
      rect.setAttribute('height', '16');
      rect.setAttribute('rx', '4');
      rect.setAttribute('fill', '#171717');
      g.appendChild(rect);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(spanLeft + spanWidth / 2));
      text.setAttribute('y', '82');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-weight', '600');
      text.textContent = span.label;
      g.appendChild(text);
    });
    
    // Weeks and events
    weeks.forEach((week, i) => {
      if (week.isSpecial) return;
      
      const weekCenterX = i * weekWidth + weekWidth / 2;
      const weekLabel = week.label?.includes('Week') ? week.label : `Week ${week.weekNum}`;
      const events = weekEvents[i] || [];
      
      // Week circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(weekCenterX));
      circle.setAttribute('cy', '80');
      circle.setAttribute('r', '18');
      circle.setAttribute('fill', '#171717');
      g.appendChild(circle);
      
      const circleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      circleText.setAttribute('x', String(weekCenterX));
      circleText.setAttribute('y', '85');
      circleText.setAttribute('text-anchor', 'middle');
      circleText.setAttribute('fill', '#ffffff');
      circleText.setAttribute('font-size', '13');
      circleText.setAttribute('font-weight', '600');
      circleText.textContent = String(week.weekNum);
      g.appendChild(circleText);
      
      // Week label
      const weekLabelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      weekLabelText.setAttribute('x', String(weekCenterX));
      weekLabelText.setAttribute('y', '110');
      weekLabelText.setAttribute('text-anchor', 'middle');
      weekLabelText.setAttribute('fill', '#171717');
      weekLabelText.setAttribute('font-size', '14');
      weekLabelText.setAttribute('font-weight', '500');
      weekLabelText.textContent = weekLabel;
      g.appendChild(weekLabelText);
      
      // Events
      events.forEach((event, ei) => {
        const color = deptColorMap[event.department || 'Execution'] || '#6366f1';
        const eventY = 140 + ei * 34;
        const eventX = weekCenterX - eventContainerWidth / 2;
        
        // Event rectangle
        const eventRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        eventRect.setAttribute('x', String(eventX));
        eventRect.setAttribute('y', String(eventY - 12));
        eventRect.setAttribute('width', String(eventContainerWidth));
        eventRect.setAttribute('height', '28');
        eventRect.setAttribute('rx', '6');
        eventRect.setAttribute('fill', color);
        eventRect.setAttribute('opacity', '0.9');
        g.appendChild(eventRect);
        
        // Left border
        const border = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        border.setAttribute('x1', String(eventX));
        border.setAttribute('y1', String(eventY - 12));
        border.setAttribute('x2', String(eventX));
        border.setAttribute('y2', String(eventY + 16));
        border.setAttribute('stroke', color);
        border.setAttribute('stroke-width', '4');
        g.appendChild(border);
        
        // Event text
        const eventText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        eventText.setAttribute('x', String(eventX + 10));
        eventText.setAttribute('y', String(eventY + 2));
        eventText.setAttribute('fill', '#ffffff');
        eventText.setAttribute('font-size', '11');
        eventText.setAttribute('font-weight', '500');
        eventText.textContent = event.name;
        g.appendChild(eventText);
      });
    });
    
    // Now indicator
    if (nowLeft !== null) {
      const nowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      nowLine.setAttribute('x1', String(nowLeft));
      nowLine.setAttribute('y1', '32');
      nowLine.setAttribute('x2', String(nowLeft));
      nowLine.setAttribute('y2', String(dynamicHeight));
      nowLine.setAttribute('stroke', '#171717');
      nowLine.setAttribute('stroke-width', '1');
      nowLine.setAttribute('opacity', '0.5');
      g.appendChild(nowLine);
      
      const nowRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      nowRect.setAttribute('x', String(nowLeft - 20));
      nowRect.setAttribute('y', '0');
      nowRect.setAttribute('width', '40');
      nowRect.setAttribute('height', '20');
      nowRect.setAttribute('rx', '4');
      nowRect.setAttribute('fill', '#171717');
      g.appendChild(nowRect);
      
      const nowText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nowText.setAttribute('x', String(nowLeft));
      nowText.setAttribute('y', '13');
      nowText.setAttribute('text-anchor', 'middle');
      nowText.setAttribute('fill', '#ffffff');
      nowText.setAttribute('font-size', '10');
      nowText.setAttribute('font-weight', '600');
      nowText.textContent = 'Now';
      g.appendChild(nowText);
    }
    
    svg.appendChild(g);
    
    // Convert to blob and download
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-timeline.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-foreground/10 bg-background shadow-sm p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg md:text-xl font-semibold text-foreground">{title}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSVG}
            className="px-3 py-1.5 text-sm rounded-sm border border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/20 transition-colors flex items-center gap-1.5"
            aria-label="Download as SVG"
            title="Download as SVG"
          >
            <DownloadIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={() => setSem('sem1')}
            className={`px-3 py-1.5 text-sm rounded-sm border transition-colors ${
              sem === 'sem1' 
                ? 'border-foreground/30 text-foreground bg-foreground/5' 
                : 'border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/20'
            }`}
            aria-label="Semester I"
          >
            I
          </button>
          <button
            onClick={() => setSem('sem2')}
            className={`px-3 py-1.5 text-sm rounded-sm border transition-colors ${
              sem === 'sem2' 
                ? 'border-foreground/30 text-foreground bg-foreground/5' 
                : 'border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/20'
            }`}
            aria-label="Semester II"
          >
            II
          </button>
        </div>
      </div>

      {/* Simplified Timeline */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex justify-center">
          <div 
            ref={timelineRef}
            className="relative" 
            style={{ 
              width: containerWidth,
              height: `${dynamicHeight}px`,
            }}
          >
            {/* Dark overlay for past time */}
            {nowLeft !== null && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: 0,
                  top: 0,
                  width: nowLeft,
                  height: '100%',
                  background: 'linear-gradient(to right, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.03), transparent)',
                  zIndex: 2,
                }}
              />
            )}

            {/* Central Rail - horizontal line - spans full width continuously */}
            <div 
              className="absolute bg-foreground"
              style={{ 
                left: 0,
                width: `${containerWidth}px`,
                top: '80px', 
                height: '4px',
                borderRadius: '2px',
                zIndex: 1,
              }}
            />

          {/* Special periods on rail */}
          {(() => {
            const specialSpans: Array<{ startIdx: number; endIdx: number; label: string }> = [];
            let currentSpan: { startIdx: number; label: string } | null = null;

            weeks.forEach((week, i) => {
              if (week.isSpecial && week.label) {
                if (!currentSpan) {
                  currentSpan = { startIdx: i, label: week.label };
                }
              } else {
                if (currentSpan) {
                  const span = currentSpan;
                  specialSpans.push({ startIdx: span.startIdx, label: span.label, endIdx: i - 1 });
                  currentSpan = null;
                }
              }
            });
            if (currentSpan) {
              const span = currentSpan as { startIdx: number; label: string };
              specialSpans.push({ startIdx: span.startIdx, label: span.label, endIdx: weeks.length - 1 });
            }

            return specialSpans.map((span, spanIdx) => {
              const spanLeft = span.startIdx * weekWidth;
              const spanWidth = (span.endIdx - span.startIdx + 1) * weekWidth;
              return (
                <div
                  key={`span-${spanIdx}`}
                  className="absolute bg-foreground text-background px-3 py-2 text-sm font-semibold rounded-lg shadow-md"
                  style={{
                    left: spanLeft,
                    top: '78px',
                    transform: 'translateY(-50%)',
                    width: spanWidth,
                    textAlign: 'center',
                    zIndex: 5,
                  }}
                >
                  {span.label}
                </div>
              );
            });
          })()}

          {/* Weeks and Events */}
          {weeks.map((week, i) => {
            const weekStartX = i * weekWidth;
            const events = weekEvents[i] || [];
            const isSpecial = week.isSpecial;

            // Skip rendering week marker for special periods (they have the block on rail)
            if (isSpecial) {
              return null;
            }

            // Get simple week label
            const weekLabel = week.label?.includes('Week') ? week.label : `Week ${week.weekNum}`;
            
            return (
              <div 
                key={i} 
                className="absolute" 
                style={{ 
                  left: weekStartX, 
                  top: 0,
                  width: `${weekWidth}px`,
                  height: `${dynamicHeight}px`,
                  overflow: 'visible',
                  pointerEvents: 'none',
                }}
              >
                {/* Week circle marker on rail */}
                <div
                  className="absolute bg-foreground text-background rounded-full flex items-center justify-center font-semibold shadow-md z-10 pointer-events-none"
                  style={{
                    width: '40px',
                    height: '40px',
                    top: '62px',
                    left: `${weekWidth / 2 - 20}px`,
                    fontSize: '14px',
                    border: '2px solid var(--background)',
                  }}
                >
                  {week.weekNum}
                </div>

                {/* Week label below circle */}
                <div
                  className="absolute text-sm text-foreground font-medium z-10 pointer-events-none text-center"
                  style={{
                    top: '110px',
                    left: '0',
                    width: '100%',
                  }}
                >
                  {weekLabel}
                </div>

                {/* Events list - all below the timeline */}
                {events.length > 0 && (
                  <div
                    className="absolute"
                    style={{
                      width: `${eventContainerWidth}px`,
                      left: `${(weekWidth - eventContainerWidth) / 2}px`,
                      top: '140px',
                      zIndex: 5,
                      pointerEvents: 'auto',
                      overflow: 'visible',
                    }}
                  >
                      <ul className="space-y-1.5">
                        {events.map((event) => {
                          const color = deptColorMap[event.department || 'Execution'] || '#6366f1';
                          // Convert hex to rgba for background with opacity
                          const hexToRgba = (hex: string, alpha: number) => {
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                          };
                          return (
                            <li
                              key={event.id}
                              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium leading-snug text-white shadow-sm transition-all hover:shadow-md"
                              style={{ 
                                backgroundColor: hexToRgba(color, 0.9),
                                borderLeft: `4px solid ${color}`,
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                maxWidth: '100%',
                                width: '100%',
                                boxSizing: 'border-box',
                                display: 'block',
                              }}
                            >
                              {event.name}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                )}
              </div>
            );
          })}

          {/* Now indicator */}
          {nowLeft !== null && (
            <div
              className="absolute"
              style={{
                left: nowLeft,
                top: 0,
                zIndex: 15,
              }}
            >
              {/* "Now" label at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
                Now
              </div>
              {/* Vertical line */}
              <div 
                className="absolute w-0.5 bg-foreground/50" 
                style={{ 
                  top: '32px', 
                  bottom: '0',
                }} 
              />
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[#ef4444]">●</span>
          <span className="text-foreground/70">Flagship: {counts['Flagship'] || 0}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#f59e0b]">●</span>
          <span className="text-foreground/70">Workshops: {counts['A&W'] || 0}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#6366f1]">●</span>
          <span className="text-foreground/70">Non Flagship: {counts['Execution'] || 0}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#10b981]">●</span>
          <span className="text-foreground/70">Industrial Visit: {counts['SPR'] || 0}</span>
        </div>
      </div>
    </div>
  );
}
