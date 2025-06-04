import { OptimizedEvent } from '../eventUtils.js';

describe('OptimizedEvent date/time helpers', () => {
  test('getStartDateTime returns null if no entry_date', () => {
    const event = new OptimizedEvent({});
    expect(event.getStartDateTime()).toBeNull();
  });

  test('getStartDateTime returns Date when entry_date and entry_time provided', () => {
    const event = new OptimizedEvent({ entry_date: '2024-03-15', entry_time: '14:30' });
    const result = event.getStartDateTime();
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(new Date('2024-03-15T14:30').toISOString());
  });

  test('getEndDateTime respects hasEndDateTime flag', () => {
    const event = new OptimizedEvent({ end_date: '2024-03-15', end_time: '15:00', hasEndDateTime: false });
    expect(event.getEndDateTime()).toBeNull();
    event.hasEndDateTime = true;
    const result = event.getEndDateTime();
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe(new Date('2024-03-15T15:00').toISOString());
  });

  test('getDuration calculates minutes between start and end', () => {
    const event = new OptimizedEvent({
      entry_date: '2024-03-15',
      entry_time: '14:00',
      end_date: '2024-03-15',
      end_time: '15:30',
      hasEndDateTime: true
    });
    expect(event.getDuration()).toBe(90);
  });

  test('getFormattedDuration formats duration strings', () => {
    const base = { entry_date: '2024-03-15', entry_time: '12:00', hasEndDateTime: true };
    let event = new OptimizedEvent({ ...base, end_date: '2024-03-15', end_time: '12:30' });
    expect(event.getFormattedDuration()).toBe('30min');
    event = new OptimizedEvent({ ...base, end_date: '2024-03-15', end_time: '14:00' });
    expect(event.getFormattedDuration()).toBe('2h');
    event = new OptimizedEvent({ ...base, end_date: '2024-03-15', end_time: '13:30' });
    expect(event.getFormattedDuration()).toBe('1h 30min');
    event = new OptimizedEvent({ entry_date: '2024-03-15', entry_time: '12:00' });
    expect(event.getFormattedDuration()).toBe('Momentan');
  });

  test('isActiveAt works for ranged and point events', () => {
    const ranged = new OptimizedEvent({
      entry_date: '2024-03-15',
      entry_time: '12:00',
      end_date: '2024-03-15',
      end_time: '14:00',
      hasEndDateTime: true
    });
    const point = new OptimizedEvent({ entry_date: '2024-03-15', entry_time: '12:00' });
    const start = new Date('2024-03-15T12:00').getTime();
    const end = new Date('2024-03-15T14:00').getTime();
    expect(ranged.isActiveAt(start)).toBe(true);
    expect(ranged.isActiveAt(end)).toBe(true);
    expect(ranged.isActiveAt(end + 1000)).toBe(false);
    const windowBefore = start - 29 * 60 * 1000; // 29 min before
    const windowAfter = start + 29 * 60 * 1000; // 29 min after
    expect(point.isActiveAt(windowBefore)).toBe(true);
    expect(point.isActiveAt(windowAfter)).toBe(true);
    expect(point.isActiveAt(start - 31 * 60 * 1000)).toBe(false);
  });
});
