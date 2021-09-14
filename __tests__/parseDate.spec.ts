import dtsel from '../dtsel'
import DTSel from '../types/dtsel'


const cases: [string, string, string, Date][] = [
  ['slash separator', '2012/12/12', 'YYYY/MM/DD', new Date(2012, 11, 12)],
  ['slash separator and 2 digit year', '12/12/12', 'DD/MM/YY', new Date(2012, 11, 12)],
  ['dash separator', '2012-12-31', 'YYYY-MM-DD', new Date(2012, 11, 31)],
  ['mixed casing', '12-31-19', 'mm-DD-yY', new Date(2019, 11, 31)],
];

const makeSettings = (settings: Partial<DTSel.Config>) => {
  return new dtsel.DTS(document.createElement('div'), settings)
};


describe('Parse date', () => {
  cases.forEach(([title, given, format, expected]) => {
    test(title, () => {
      const settings = makeSettings({dateFormat: format})
      expect(dtsel.fn.parseDate(given, settings).getTime())
        .toEqual(expected.getTime())
    })
  })
});
