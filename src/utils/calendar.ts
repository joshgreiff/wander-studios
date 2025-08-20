export interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  virtualLink?: string;
}

export function generateICalEvent(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let location = event.location || '';
  if (event.virtualLink) {
    location = event.virtualLink;
  }

  let description = event.description;
  if (event.virtualLink) {
    description += `\n\nVirtual Class Link: ${event.virtualLink}`;
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wander Studios//Virtual Class//EN
BEGIN:VEVENT
UID:${Date.now()}@wanderstudios.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
DESCRIPTION:${description.replace(/\n/g, '\\n')}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let location = event.location || '';
  if (event.virtualLink) {
    location = event.virtualLink;
  }

  let description = event.description;
  if (event.virtualLink) {
    description += `\n\nVirtual Class Link: ${event.virtualLink}`;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
    details: description,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadCalendarFile(icalContent: string, filename: string) {
  const blob = new Blob([icalContent], { type: 'text/calendar' });
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
  classDate: Date,
  classTime: string,
  classDescription: string,
  classAddress?: string,
  virtualLink?: string
): CalendarEvent {
  const [hours, minutes] = classTime.split(':').map(Number);
  const startDate = new Date(classDate);
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setHours(hours + 1, minutes, 0, 0); // Assume 1 hour class

  return {
    title: className,
    description: classDescription,
    startDate,
    endDate,
    location: classAddress,
    virtualLink,
  };
} 