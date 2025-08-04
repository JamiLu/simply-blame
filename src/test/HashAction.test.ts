
/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { activateExtension, createMockGitConfig } from './suite/helpers';
import Settings from '../Settings';
import Notifications from '../Notifications';
import { hashAction } from '../HashAction';

suite('Test hashAction', () => {

    const mockGitConfig = createMockGitConfig();
    let settings: sinon.SinonStub;
    let openExternal: sinon.SinonStub;
    let commonErrorSpy: sinon.SinonSpy;

    mocha.before(async () => {
        await activateExtension();
        await mockGitConfig.create();
        openExternal = sinon.stub(vscode.env, 'openExternal');
        commonErrorSpy = sinon.spy(Notifications, 'commonErrorNotification');
    });

    mocha.after(async () => {
        await mockGitConfig.purge();
        openExternal.restore();
        commonErrorSpy.restore();
    });

    mocha.beforeEach(() => {
        settings = sinon.stub(Settings, 'getHashAction');
    });
    
    mocha.afterEach(() => {
        settings.restore();
    });

    test('test testAction settings return remote', async () => {
        settings.returns('remote');
        openExternal.resolves(true);

        await hashAction('testHash');

        sinon.assert.notCalled(commonErrorSpy);
        sinon.assert.calledOnceWithExactly(openExternal, vscode.Uri.parse('https://github.com/test/test-repo/commit/testHash'));
    });


    test('test hashAction settings return copy', async () => {
        settings.returns('copy');

        hashAction('testHash');

        assert.strictEqual(await vscode.env.clipboard.readText(), 'testHash');
    });
});
