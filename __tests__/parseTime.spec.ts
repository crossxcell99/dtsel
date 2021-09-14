import dtsel from '../dtsel'
import DTSel from '../types/dtsel'


const getTime = (timeTuple: [hours?: number, minutes?: number, seconds?: number]) => {
  let [ hours, minutes, seconds ] = timeTuple
  hours = hours || 0
  minutes = minutes || 0
  seconds = seconds || 0
  return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
}

const cases: [string, string, string, number][] = [
  ['default time format', '13:30:45', 'HH:MM:SS', getTime([13, 30, 45])],
];

const makeSettings = (settings: Partial<DTSel.Config>) => {
  return new dtsel.DTS(document.createElement('div'), settings)
};


describe('Parse time', () => {
  cases.forEach(([title, given, format, expected]) => {
    test(title, () => {
      const settings = makeSettings({timeFormat: format})
      expect(dtsel.fn.parseTime(given, settings)).toEqual(expected)
    })
  })
});
