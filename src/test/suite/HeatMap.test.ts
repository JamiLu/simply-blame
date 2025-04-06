import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as blameMock from '../../Blame';
import * as heatMapMock from '../../HeatMap';
import Settings from '../../Settings';
import { activateExtension, document } from './helpers';
import { getBlame } from './Blame.test';

suite('Test HeatMap', () => {

    const heatColors = Settings.getHeatMapColors();

    mocha.before(async () => {
        await activateExtension();
    });

    test('test heatmap generation', async () => {
        const blameFileStub = sinon.stub(blameMock, 'blameFile').returns(Promise.resolve(getBlame()));

        const blamed = await blameMock.blame(document);

        const heatMap = heatMapMock.indexHeatColors(blamed, heatColors);

        assert.ok(blameFileStub.calledOnce);
        assert.strictEqual(6, blamed.length);
        assert.strictEqual(6, Object.keys(heatMap).length);

        blameFileStub.restore();
    });

    const createMockBlame = (i: number, d: Date): blameMock.BlamedDocument => {
        return {
            author: 'test',
            codeline: '1',
            date: {
                date: d,
                dateMillis: d.getTime(),
                dateString: `${d.getTime() / 1000}`,
                localDate: `${d.getFullYear()} ${d.getMonth()} ${d.getDate()}`,
            },
            email: 'test@test',
            filename: 'test.ts',
            hash: '',
            linenumber: 'f',
            summary: 'generated'
        };
    };

    test('test heatmap max color generation', () => {
        const date = new Date(2024, 0, 30); // Jan 30 2024
        const blamed: blameMock.BlamedDocument[] = [];
        for (let i = 25; i > 10; i--) {
            date.setDate(i);
            blamed.push(createMockBlame(i, date));
        }

        const heatMap = heatMapMock.indexHeatColors(blamed, heatColors);

        assert.strictEqual(15, blamed.length);
        assert.strictEqual(11, Object.keys(heatMap).length);
    });
});
