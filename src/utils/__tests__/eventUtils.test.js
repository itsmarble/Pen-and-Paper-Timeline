import { EventValidator } from '../eventUtils.js';

describe('EventValidator.validateEvent', () => {
  test('valid event returns isValid true', () => {
    const result = EventValidator.validateEvent({
      name: 'Test',
      description: 'desc',
      entry_date: '2024-01-01',
      entry_time: '12:00'
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('missing name returns error', () => {
    const result = EventValidator.validateEvent({
      description: 'desc',
      entry_date: '2024-01-01',
      entry_time: '12:00'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Event name is required');
  });

  test('missing date returns error', () => {
    const result = EventValidator.validateEvent({
      name: 'Test',
      description: 'desc',
      entry_time: '12:00'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Event date is required');
  });

  test('missing time returns error', () => {
    const result = EventValidator.validateEvent({
      name: 'Test',
      description: 'desc',
      entry_date: '2024-01-01'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Event time is required');
  });

  test('end date/time before start returns error', () => {
    const result = EventValidator.validateEvent({
      name: 'Test',
      description: 'desc',
      entry_date: '2024-01-02',
      entry_time: '12:00',
      hasEndDateTime: true,
      end_date: '2024-01-01',
      end_time: '11:00'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('End date/time must be after start date/time');
  });
});
