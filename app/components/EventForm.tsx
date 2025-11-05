'use client';

import { useState, FormEvent } from 'react';

import { Event } from '../contexts/EventsContext';

interface EventFormProps {
  onAddEvent: (event: Event) => void;
}

const DEPARTMENTS = [
  'Event Prep',
  'Internal',
  'SPR',
  'A&W',
  'Execution',
  'Flagship',
];

export default function EventForm({ onAddEvent }: EventFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Event Prep');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !name.trim()) {
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      name: name.trim(),
      department,
      location: location.trim() || undefined,
      startTime: startTime.trim() || undefined,
      endTime: endTime.trim() || undefined,
      description: description.trim() || undefined,
    };

    onAddEvent(event);
    
    // Reset form
    setStartDate('');
    setEndDate('');
    setName('');
    setDepartment('Event Prep');
    setLocation('');
    setStartTime('');
    setEndTime('');
    setDescription('');
  };

  return (
    <div>
      <h2 className="text-xl font-light mb-6">Add Event</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">
            Event Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-sm focus:outline-none focus:border-foreground/30 transition-colors"
            placeholder="Enter event name"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-sm focus:outline-none focus:border-foreground/30 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-foreground/50 mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
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
            Location (Optional)
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
            Time (Optional)
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
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-foreground/5 border border-foreground/10 rounded-sm focus:outline-none focus:border-foreground/30 transition-colors resize-none"
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="mt-2 px-4 py-2 text-sm bg-foreground text-background rounded-sm hover:opacity-90 transition-opacity font-medium"
        >
          Add Event
        </button>
      </form>
    </div>
  );
}

