import dtsel from '../dtsel'
import DTSel from '../types/dtsel'


const withTime = (hours=0, minutes=0, seconds=0) => {
  return new Date(1970, 1, 1, hours, minutes, seconds);
}

const cases: [string, Date, string, string][] = [
  ['default time format', withTime(13, 30, 45), 'HH:MM:SS', '13:30:45'],
];

const makeSettings = (settings: Partial<DTSel.Config>) => {
  return new dtsel.DTS(document.createElement('div'), settings)
};


describe('Parse time', () => {
  cases.forEach(([title, given, format, expected]) => {
    test(title, () => {
      const settings = makeSettings({timeFormat: format})
      expect(dtsel.fn.renderTime(given, settings)).toEqual(expected)
    })
  })
});
