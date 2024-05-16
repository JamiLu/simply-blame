import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as blameMock from '../../Blame';
import * as heatMapMock from '../../HeatMap';
import { activateExtension, document } from './helpers';
import { getBlame, getErrornousBlame } from './Blame.test';

suite('Test HeatMap', () => {

    mocha.before(async () => {
        await activateExtension();
    });

    test('test heatmap generation', async () => {
        const blameFileStub = sinon.stub(blameMock, 'blameFile').returns(Promise.resolve(getBlame()));

        const blamed = await blameMock.blame(document);

        const heatMap = heatMapMock.indexHeatColors(blamed);

        assert.ok(blameFileStub.calledOnce);
        assert.strictEqual(18, blamed.length);
        assert.strictEqual(11, Object.keys(heatMap).length);

        blameFileStub.restore();
    });

    test('test heatmap generation with faulty blame', async () => {
        const blameFileStub = sinon.stub(blameMock, 'blameFile').returns(Promise.resolve(getErrornousBlame()));
        
        const blamed = await blameMock.blame(document);

        const heatMap = heatMapMock.indexHeatColors(blamed);

        assert.ok(blameFileStub.calledOnce);
        assert.strictEqual(2, blamed.length);
        assert.strictEqual(1, Object.keys(heatMap).length);

        blameFileStub.restore();
    });



});
