import { EventCollection } from '../eventUtils.js';

describe('EventCollection.getDateRange', () => {
  test('returns null for empty collection', () => {
    const collection = new EventCollection([]);
    expect(collection.getDateRange()).toBeNull();
  });

  test('returns earliest and latest dates from events', () => {
    const collection = new EventCollection([
      { entry_date: '2024-01-02', entry_time: '10:00' },
      { entry_date: '2024-01-01', entry_time: '12:00' },
      { entry_date: '2024-01-03', entry_time: '09:00' }
    ]);
    const range = collection.getDateRange();
    expect(range.earliest.toISOString()).toBe(new Date('2024-01-01T12:00:00').toISOString());
    expect(range.latest.toISOString()).toBe(new Date('2024-01-03T09:00:00').toISOString());
  });

  test('ignores events without valid date', () => {
    const collection = new EventCollection([
      { entry_date: '2024-01-05', entry_time: '00:00' },
      { name: 'invalid' }
    ]);
    const range = collection.getDateRange();
    expect(range.earliest.toISOString()).toBe(new Date('2024-01-05T00:00:00').toISOString());
    expect(range.latest.toISOString()).toBe(new Date('2024-01-05T00:00:00').toISOString());
  });
});
