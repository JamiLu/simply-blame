/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { activateExtension, createMockGitConfig, mockActiveEditor } from './helpers';
import Settings from '../../Settings';
import Notifications from '../../Notifications';
import { hashAction } from '../../HashAction';

suite('Test HashAction', () => {

    const activeEditor = mockActiveEditor();
    const mockGitConfig = createMockGitConfig();
    let settings: sinon.SinonStub;
    let openExternal: sinon.SinonStub;
    let executeCommand: sinon.SinonStub;
    let commonErrorSpy: sinon.SinonSpy;

    mocha.before(async () => {
        await activateExtension();
        await mockGitConfig.create();
        openExternal = sinon.stub(vscode.env, 'openExternal');
        executeCommand = sinon.stub(vscode.commands, 'executeCommand');
        commonErrorSpy = sinon.spy(Notifications, 'commonErrorNotification');
    });

    mocha.after(async () => {
        await mockGitConfig.purge();
        openExternal.restore();
        executeCommand.restore();
        commonErrorSpy.restore();
    });

    mocha.beforeEach(() => {
        settings = sinon.stub(Settings, 'getHashAction');
        openExternal.resetHistory();
        executeCommand.resetHistory();
        commonErrorSpy.resetHistory();
        activeEditor.mock();
    });
    
    mocha.afterEach(() => {
        settings.restore();
        activeEditor.restore();
    });

    test('test testAction settings return remote', async () => {
        settings.returns('remote');
        openExternal.resolves(true);

        await hashAction('testHash');

        sinon.assert.notCalled(commonErrorSpy);
        sinon.assert.calledOnceWithExactly(openExternal, vscode.Uri.parse('https://github.com/test/test-repo/commit/testHash'));
    });

    test('test hashAction settings return local', async () => {
        settings.returns('local');
        executeCommand.resolves(undefined);
        
        const mockRepository = {};
        const mockApi = {
            repositories: [mockRepository]
        };
        const mockGitExtension = {
            exports: {
                getAPI: sinon.stub().returns(mockApi)
            }
        };
        const getExtensionStub = sinon.stub(vscode.extensions, 'getExtension').returns(mockGitExtension as any);

        await hashAction('testHash');

        sinon.assert.notCalled(commonErrorSpy);
        sinon.assert.notCalled(openExternal);
        sinon.assert.calledOnceWithExactly(executeCommand, 'git.viewCommit', mockRepository, 'testHash', vscode.window.activeTextEditor?.document.uri);
        
        getExtensionStub.restore();
    });


    test('test hashAction settings return copy', async () => {
        settings.returns('copy');

        hashAction('testHash');

        assert.strictEqual(await vscode.env.clipboard.readText(), 'testHash');
    });
});
