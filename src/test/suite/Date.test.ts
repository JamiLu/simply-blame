import * as assert from 'assert';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import * as dateMock from '../../Date';
import Settings from '../../Settings';

suite('Test Date', () => {

    const FIXED_DATE = new Date('2024-12-31');
    const SHORT_DATE = new Date('2025-07-01');

    let stub: sinon.SinonStub;

    mocha.beforeEach(() => {
        stub = sinon.stub(Settings, 'getDateFormat');
    });

    mocha.afterEach(() => {
        stub.restore();
    });

    test('test parse YYYY/MM/DD date format', () => {
        stub.returns('YYYY/MM/DD');
        assert.strictEqual(dateMock.parseDate(FIXED_DATE), '2024/12/31');
    });

    test('test parse YYYY.MM.DD date format', () => {
        stub.returns('YYYY.MM.DD');
        assert.strictEqual(dateMock.parseDate(FIXED_DATE), '2024.12.31');
    });

    test('test parse YYYY-MM-DD date format', () => {
        stub.returns('YYYY-MM-DD');
        assert.strictEqual(dateMock.parseDate(FIXED_DATE), '2024-12-31');
    });

    test('test parse DD-MM-YYYY date format', () => {
        stub.returns('DD-MM-YYYY');
        assert.strictEqual(dateMock.parseDate(FIXED_DATE), '31-12-2024');
    });

    test('test parse DD/MM/YYYY date format', () => {
        stub.returns('DD/MM/YYYY');
        assert.strictEqual(dateMock.parseDate(FIXED_DATE), '31/12/2024');
    });

    test('test parse DD.MM.YYYY date format', () => {
        stub.returns('DD.MM.YYYY'); 
        assert.strictEqual(dateMock.parseDate(FIXED_DATE), '31.12.2024');
    });

    test('test parse MM.DD.YYYY date format', () => {
        stub.returns('MM.DD.YYYY');
        assert.strictEqual(dateMock.parseDate(FIXED_DATE), '12.31.2024');
    });

    test('test parse MM-DD-YYYY date format', () => {
        stub.returns('MM-DD-YYYY');
        assert.strictEqual(dateMock.parseDate(FIXED_DATE), '12-31-2024');
    });

    test('test parse MM/DD/YYYY date format', () => {
        stub.returns('MM/DD/YYYY');
        assert.strictEqual(dateMock.parseDate(FIXED_DATE), '12/31/2024');
    });

    test('test parse M.D.YYYY date format', () => {
        stub.returns('M.D.YYYY');
        assert.strictEqual(dateMock.parseDate(SHORT_DATE).trim(), '7.1.2025');
    });

    test('test parse M/D/YYYY date format', () => {
        stub.returns('M/D/YYYY');
        assert.strictEqual(dateMock.parseDate(SHORT_DATE).trim(), '7/1/2025');
    });

    test('test parse M-D-YYYY date format', () => {
        stub.returns('M-D-YYYY');
        assert.strictEqual(dateMock.parseDate(SHORT_DATE).trim(), '7-1-2025');
    });

    test('test parse D.M.YYYY date format', () => {
        stub.returns('D.M.YYYY');
        assert.strictEqual(dateMock.parseDate(SHORT_DATE).trim(), '1.7.2025');
    });

    test('test parse D/M/YYYY date format', () => {
        stub.returns('D/M/YYYY');
        assert.strictEqual(dateMock.parseDate(SHORT_DATE).trim(), '1/7/2025');
    });

    test('test parse D-M-YYYY date format', () => {
        stub.returns('D-M-YYYY');
        assert.strictEqual(dateMock.parseDate(SHORT_DATE).trim(), '1-7-2025');
    });
});
