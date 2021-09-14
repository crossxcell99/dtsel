import dtsel from '../dtsel'
import DTSel from '../types/dtsel'


const cases: [string, Date, string, string][] = [
  ['default date format', new Date(2011, 11, 25), 'DD/MM/YY', '25/12/11'],
];

const makeSettings = (settings: Partial<DTSel.Config>) => {
  return new dtsel.DTS(document.createElement('div'), settings)
};


describe('Parse date', () => {
  cases.forEach(([title, given, format, expected]) => {
    test(title, () => {
      const settings = makeSettings({dateFormat: format})
      expect(dtsel.fn.renderDate(given, settings)).toEqual(expected)
    })
  })
});
