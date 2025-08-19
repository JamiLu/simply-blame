/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as blameMock from '../../Blame';
import * as heatMapMock from '../../HeatMap';
import * as utils from '../../Utils';
import Settings from '../../Settings';
import { activateExtension, createMockBlamedDocument, document } from './helpers';
import { getBlame } from './Blame.test';

suite('Test HeatMap', () => {

    const heatColors = [
        "#990000",
        "#910808",
        "#8a0f0f",
        "#821717",
        "#7a1f1f",
        "#732626",
        "#6b2e2e",
        "#633636",
        "#5c3d3d",
        "#544545",
        "#382e2e"
    ];

    let strategyStub: sinon.SinonStub;

    mocha.before(async () => {
        await activateExtension();
    });

    mocha.beforeEach(() => {
        strategyStub = sinon.stub(Settings, 'getHeatColorIndexStrategy');
    });

    mocha.afterEach(() => {
        strategyStub.restore();
    });

    test('test heatmap generation highlight strategy', async () => {
        strategyStub.returns('highlight');
        const blameFileStub = sinon.stub(blameMock, 'blameFile').returns(Promise.resolve(getBlame()));

        const blamed = await blameMock.blame(document);

        const heatMap = heatMapMock.indexHeatColors(blamed, heatColors);

        assert.ok(blameFileStub.calledOnce);
        assert.strictEqual(10, blamed.length);
        assert.strictEqual(6, Object.keys(heatMap).length);

        blameFileStub.restore();
    });

    test('test heatmap max color generation highlight strategy', () => {
        strategyStub.returns('highlight');
        const blamed = createMockBlamedDocument();

        const heatMap = heatMapMock.indexHeatColors(blamed, heatColors);

        assert.strictEqual(15, blamed.length);
        assert.strictEqual(11, Object.keys(heatMap).length);
    });

    test('test heatmap max color generation scale strategy', () => {
        strategyStub.returns('scale');
        const blamed = createMockBlamedDocument();

        const heatMap = heatMapMock.indexHeatColors(blamed, heatColors);
        const distinctColors = Object.values(heatMap).reduce((prev: string[] | vscode.ThemeColor[], cur: string | vscode.ThemeColor) => {
            if (!prev.includes(cur as string)) {
                prev.push(cur as string);
            }
            return prev;
        }, []);

        assert.strictEqual(15, blamed.length);
        assert.strictEqual(15, Object.keys(heatMap).length);
        assert.strictEqual(11, distinctColors.length);
    });

    test('test generate heat colors dark', () => {
        const stub = sinon.stub(utils, 'isDarkTheme').returns(true);
        const expected = ['#fa6464', '#f25c5c', '#ea5454', '#e24c4c', '#da4444', '#d23c3c', '#ca3434', '#c22c2c', '#ba2424', '#ab1515'];

        const colors = heatMapMock.generateHeatMapColors({r: 250, g: 100, b: 100, c: 3});

        assert.strictEqual(10, colors.length);
        colors.forEach(((c, i) => assert.strictEqual(c, expected[i])));

        stub.restore();
    });
    
    test('test generate heat colors light', () => {
        const stub = sinon.stub(utils, 'isDarkTheme').returns(false);
        const expected = ['#fa6464', '#f25c5c', '#ea5454', '#e24c4c', '#da4444', '#d23c3c', '#d14444', '#d04c4c', '#cf5454', '#ce5c5c'];

        const colors = heatMapMock.generateHeatMapColors({r: 250, g: 100, b: 100, c: 3});

        assert.strictEqual(10, colors.length);
        colors.forEach((c, i) => assert.strictEqual(c, expected[i]));

        stub.restore();
    });

});
