/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { activateExtension, createMockBlamedDocument, document } from './helpers';
import HeatMapManager from '../../HeatMapManager';
import DecorationManager from '../../DecorationManager';
import Settings from '../../Settings';

suite('Test Decoration Manager', () => {

    const heatMapManager = new HeatMapManager();
    const decorationManager = new DecorationManager(heatMapManager);

    let styleStub: sinon.SinonStub;

    mocha.before(async () => {
        await activateExtension();
    });

    mocha.beforeEach(() => {
        styleStub = sinon.stub(Settings, 'getHoverStyle');
    });

    mocha.afterEach(() => {
        styleStub.restore();
    });

    test('create decoration option hover message simple', () => {
        styleStub.returns('minimal');
        decorationManager.refresh();

        const blamed = createMockBlamedDocument();
        const range = document.lineAt(0).range;

        const [name] = decorationManager.getDecorationOptions(range, blamed[0]);

        const str = name.hoverMessage as vscode.MarkdownString;
        const message = str.value;

        assert.doesNotMatch(message, /account|mail|calendar/);
        assert.match(message, /copy|generated/);
    });

    test('create decoration option hover message normal', () => {
        styleStub.returns('normal');
        decorationManager.refresh();

        const blamed = createMockBlamedDocument();
        const range = document.lineAt(0).range;

        const [name] = decorationManager.getDecorationOptions(range, blamed[0]);

        const str = name.hoverMessage as vscode.MarkdownString;
        const message = str.value;

        assert.match(message, /account|mail|calendar/);
        assert.match(message, /copy|generated/);
    });
    
});
