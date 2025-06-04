import { EventFormatter } from '../eventUtils';

describe('EventFormatter', () => {
  test('formatDateTime returns German formatted string', () => {
    const result = EventFormatter.formatDateTime('2024-03-15', '14:30');
    expect(result).toBe('15.03.2024, 14:30');
  });

  test('formatDateTime falls back for invalid date', () => {
    const result = EventFormatter.formatDateTime('invalid', 'time');
    expect(result).toBe('invalid time');
  });

  test('formatDateRange concatenates formatted start and end', () => {
    const range = EventFormatter.formatDateRange('2024-03-15', '14:30', '2024-03-16', '10:00');
    expect(range).toBe('15.03.2024, 14:30 - 16.03.2024, 10:00');
  });

  test('formatDateRange returns start if end missing', () => {
    const range = EventFormatter.formatDateRange('2024-03-15', '14:30');
    expect(range).toBe('15.03.2024, 14:30');
  });
});
