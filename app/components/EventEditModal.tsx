'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Event, useEvents } from '../contexts/EventsContext';

const DEPARTMENTS = [
  'Event Prep',
  'Internal',
  'Public Holiday',
  'SPR',
  'A&W',
  'Execution',
  'Flagship',
  'Collaboration',
];

interface EventEditModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  // Optionally specify the date context being edited (YYYY-MM-DD)
  dateISO?: string;
}

export default function EventEditModal({ event, isOpen, onClose, dateISO }: EventEditModalProps) {
  const { updateEvent } = useEvents();
  const [name, setName] = useState(event.name);
  const [department, setDepartment] = useState(event.department);
  const [scopeAllDays, setScopeAllDays] = useState(true);
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(event.name);
      setDepartment(event.department);
      // Load values based on scope and date
      const per = (dateISO && event.perDay?.[dateISO]) || {};
      setLocation((per.location ?? event.location) || '');
      setStartTime((per.startTime ?? event.startTime) || '');
      setEndTime((per.endTime ?? event.endTime) || '');
      setDescription((per.description ?? event.description) || '');
    }
  }, [event, isOpen, dateISO]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (scopeAllDays || !dateISO) {
      // Update defaults for all days
      updateEvent(event.id, {
        name: name.trim(),
        department,
        location: location.trim() || undefined,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        description: description.trim() || undefined,
      });
    } else {
      // Update only this specific day override
      const nextPer = { ...(event.perDay || {}) } as NonNullable<Event['perDay']>;
      nextPer[dateISO] = {
        location: location.trim() || undefined,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        description: description.trim() || undefined,
      };
      updateEvent(event.id, { perDay: nextPer });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl border border-foreground/10 shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Edit Event</h2>
            <button
              onClick={onClose}
              className="text-foreground/50 hover:text-foreground transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {dateISO && (
              <div className="flex items-center justify-between">
                <div className="text-xs text-foreground/50">Editing for {dateISO}</div>
                <label className="flex items-center gap-2 text-xs text-foreground/60">
                  <input
                    type="checkbox"
                    checked={scopeAllDays}
                    onChange={(e) => setScopeAllDays(e.target.checked)}
                  />
                  Apply to all days in this event
                </label>
              </div>
            )}
            <div>
              <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">
                Event Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-sm focus:outline-none focus:border-foreground/30 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-sm focus:outline-none focus:border-foreground/30 transition-colors"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-sm focus:outline-none focus:border-foreground/30 transition-colors"
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">
                Time
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-sm focus:outline-none focus:border-foreground/30 transition-colors"
                />
                <span className="text-foreground/40 text-sm">to</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-sm focus:outline-none focus:border-foreground/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-sm focus:outline-none focus:border-foreground/30 transition-colors resize-none"
                placeholder="Enter description"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm border border-foreground/20 rounded-sm hover:bg-foreground/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

