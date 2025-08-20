export interface CalendarEvent {
  title: string;
  description: string;
  location?: string;
  startDate: string;
  endDate: string;
  organizer?: {
    name: string;
    email: string;
  };
}

export function generateICalEvent(event: CalendarEvent): string {
  const formatDate = (date: string) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string) => {
    return text
      .replace(/[\\;,]/g, '\\$&')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  };

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wander Movement//Class Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@wandermovement.com`,
    `DTSTAMP:${formatDate(new Date().toISOString())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    ...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
    ...(event.organizer ? [
      `ORGANIZER;CN=${escapeText(event.organizer.name)}:mailto:${event.organizer.email}`
    ] : []),
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return ical;
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    details: event.description,
    ...(event.location && { location: event.location }),
    ...(event.organizer && { ctz: 'America/New_York' })
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadCalendarFile(icalContent: string, filename: string) {
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function createClassCalendarEvent(
  className: string,
  date: string,
  time: string,
  duration: number = 60,
  location?: string,
  description?: string
): CalendarEvent {
  const startDate = new Date(`${date}T${time}`);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  return {
    title: `Wander Movement - ${className}`,
    description: description || `Join us for ${className} at Wander Movement!`,
    location: location || 'Wander Movement Studio',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    organizer: {
      name: 'Wander Movement',
      email: 'hello@wandermovement.com'
    }
  };
} 