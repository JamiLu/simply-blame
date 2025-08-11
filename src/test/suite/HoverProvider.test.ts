/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import { activateExtension, createMockBlamedDocument, document } from './helpers';
import Settings from '../../Settings';
import BlameHoverProvider from '../../BlameHoverProvider';
import BlameManager from '../../BlameManager';

suite('Test Hover Provider', () => {

    const blameManager = new BlameManager();
    const hoverProvider = new BlameHoverProvider(blameManager);

    let styleStub: sinon.SinonStub;
    let mockManager = sinon.mock(blameManager);

    mocha.before(async () => {
        await activateExtension();
    });

    mocha.beforeEach(() => {
        styleStub = sinon.stub(Settings, 'getHoverStyle');
    });

    mocha.afterEach(() => {
        styleStub.restore();
        mockManager.restore();
    });

    test('create minimal hover', async () => {
        styleStub.returns('minimal');
        hoverProvider.refresh();

        const blamed = createMockBlamedDocument();
        mockManager.expects('getBlameAt').returns(blamed[0]).calledWith(0);

        const hover = await hoverProvider.provideHover(document, new vscode.Position(0, 0), {} as vscode.CancellationToken);

        const str = hover?.contents[0] as vscode.MarkdownString;
        const message = str.value;

        assert.doesNotMatch(message, /account|mail|calendar|copy/);
        assert.match(message, /hashAction|generated/);
    });

    test('create normal hover', async () => {
        styleStub.returns('normal');
        hoverProvider.refresh();

        const blamed = createMockBlamedDocument();
        mockManager.expects('getBlameAt').returns(blamed[0]).calledWith(0);

        const hover = await hoverProvider.provideHover(document, new vscode.Position(0, 0), {} as vscode.CancellationToken);

        const str = hover?.contents[0] as vscode.MarkdownString;
        const message = str.value;

        assert.match(message, /account|mail|calendar/);
        assert.match(message, /copy|generated/);
    });
});
