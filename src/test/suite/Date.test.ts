/**
 * License GPL-2.0
 */
import * as assert from 'assert';
import * as dateMock from '../../Date';

suite('Test Date', () => {

    const FIXED_DATE = new Date('2024-12-31');
    const SHORT_DATE = new Date('2025-07-01');

    test('test parse YYYY/MM/DD date format', () => {
        assert.strictEqual(dateMock.parseDate(FIXED_DATE, 'YYYY/MM/DD'), '2024/12/31');
    });

    test('test parse YYYY.MM.DD date format', () => {
        assert.strictEqual(dateMock.parseDate(FIXED_DATE, 'YYYY.MM.DD'), '2024.12.31');
    });

    test('test parse YYYY-MM-DD date format', () => {
        assert.strictEqual(dateMock.parseDate(FIXED_DATE, 'YYYY-MM-DD'), '2024-12-31');
    });

    test('test parse DD-MM-YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(FIXED_DATE, 'DD-MM-YYYY'), '31-12-2024');
    });

    test('test parse DD/MM/YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(FIXED_DATE, 'DD/MM/YYYY'), '31/12/2024');
    });

    test('test parse DD.MM.YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(FIXED_DATE, 'DD.MM.YYYY'), '31.12.2024');
    });

    test('test parse MM.DD.YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(FIXED_DATE, 'MM.DD.YYYY'), '12.31.2024');
    });

    test('test parse MM-DD-YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(FIXED_DATE, 'MM-DD-YYYY'), '12-31-2024');
    });

    test('test parse MM/DD/YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(FIXED_DATE, 'MM/DD/YYYY'), '12/31/2024');
    });

    test('test parse M.D.YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(SHORT_DATE, 'M.D.YYYY').trim(), '7.1.2025');
    });

    test('test parse M/D/YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(SHORT_DATE, 'M/D/YYYY').trim(), '7/1/2025');
    });

    test('test parse M-D-YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(SHORT_DATE, 'M-D-YYYY').trim(), '7-1-2025');
    });

    test('test parse D.M.YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(SHORT_DATE, 'D.M.YYYY').trim(), '1.7.2025');
    });

    test('test parse D/M/YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(SHORT_DATE, 'D/M/YYYY').trim(), '1/7/2025');
    });

    test('test parse D-M-YYYY date format', () => {
        assert.strictEqual(dateMock.parseDate(SHORT_DATE, 'D-M-YYYY').trim(), '1-7-2025');
    });
});
