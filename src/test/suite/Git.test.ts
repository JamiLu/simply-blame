/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { getCommitMessage, blameFile } from '../../Git';
import { activateExtension, createMockBlame, document } from './helpers';
import * as cmdMock from '../../Command';
import { getLocation } from '../../Utils';
import Notifications from '../../Notifications';
import WorkspaceStateHolder from '../../WorkspaceStateHolder';
import Settings from '../../Settings';

const fakeMemento: vscode.Memento = {
    get() {},
    async update(key: string, value: string) {},
    keys(): readonly string[] {
        return [];
    }
};

const stateInstance = WorkspaceStateHolder.create(fakeMemento);

suite('Test Git commands', () => {

    const blame = createMockBlame(10, new Date(2025, 2, 10)); // 10th March 2025

    let commandStub: sinon.SinonStub;
    let gitNotFoundSpy: sinon.SinonSpy;
    let commonErrorSpy: sinon.SinonSpy;
    let stateStub: sinon.SinonStub;
    let settingsIgnoreWhiteSpaceStub: sinon.SinonStub;

    mocha.before(async () => {
        await activateExtension();
        commandStub = sinon.stub(cmdMock, 'command');
        gitNotFoundSpy = sinon.spy(Notifications, 'gitNotFoundNotification');
        commonErrorSpy = sinon.spy(Notifications, 'commonErrorNotification');
        stateStub = sinon.stub(stateInstance, 'ignoreWhiteSpaceToggle');
        settingsIgnoreWhiteSpaceStub = sinon.stub(Settings, 'getBlameIgnoreWhitespace');
    });

    mocha.after(() => {
        commandStub.restore();
        gitNotFoundSpy.restore();
        commonErrorSpy.restore();
        stateStub.restore();
        settingsIgnoreWhiteSpaceStub.restore();
    });

    test('test getCommitMessage', async () => {
        
        commandStub.returns(`commit fa58dadeab64b782f9b4196f5c075e255f8126fc
Author: Tester Testaaja Test <testing@tester.test>
Date:   Mon Aug 4 22:30:49 2025 +0300

    This is a commit title

    This is a commit body message. Which is a long text that describes the commit. I have to think hard to figure out what to write here since this is important for the others to know what has been done in this particular commit.
    
    Few points about this commit:
    * There was a variable called foobar that was declared
    * A keyword var was used to declare the variable foobar
    * The const or the let keywords could have been used instead due it is more advanced
    
    Maybe this commit message is long and descriptive enough to prove a point.

diff --git
`);

        const message = await getCommitMessage(document, blame.hash);

        sinon.assert.calledWithExactly(commandStub, `git show a`, getLocation(document.fileName));

        assert.strictEqual(message, `This is a commit title

This is a commit body message. Which is a long text that describes the commit. I have to think hard to figure out what to write here since this is important for the others to know what has been done in this particular commit.

Few points about this commit:
* There was a variable called foobar that was declared
* A keyword var was used to declare the variable foobar
* The const or the let keywords could have been used instead due it is more advanced

Maybe this commit message is long and descriptive enough to prove a point.`);
    });

    test('test blameFile throws git not found git not found notification shown', async () => {
        commandStub.throwsException(new Error('git: not found'));

        await blameFile('test.txt');        
        
        assert.ok(gitNotFoundSpy.calledOnce);
    });

    test('test blameFile throws error common notification is shown', async () => {
        commandStub.throwsException(new Error('something happened'));

        await blameFile('test.txt');

        assert.ok(commonErrorSpy.calledOnce);
    });

    test('test blameFile shows a warning message when path is not in HEAD', async () => {
        const showWarningMessage = sinon.stub(vscode.window, 'showWarningMessage');

        commandStub.throwsException(new Error('fatal: no such path dev/index.ts in HEAD'));

        await blameFile('index.ts');

        assert.ok(showWarningMessage.calledOnce);
        showWarningMessage.restore();
    });

    test('test blameFile slash succeeds', async () => {      
        await blameFile('path/to/file/test.ts');
        
        sinon.assert.calledWithExactly(commandStub, `git blame --porcelain \"test.ts\"`, `path/to/file/`);
    });

    test('test blameFile backslash succeeds', async () => {
        await blameFile('path\\to\\file\\test.ts');

        sinon.assert.calledWithExactly(commandStub, `git blame --porcelain \"test.ts\"`, 'path\\to\\file\\');
    });

    test('test blameFile filename with dash succeeds', async () => {
        await blameFile('path/to/file/test-this.txt');

        sinon.assert.calledWithExactly(commandStub, `git blame --porcelain \"test-this.txt\"`, `path/to/file/`);
    });

    test('test blameFile filename with space succeeds', async () => {
        await blameFile('path/to/file/test this.txt');

        sinon.assert.calledWithExactly(commandStub, `git blame --porcelain \"test this.txt\"`, `path/to/file/`);
    });

    test('test blameFile path with space succeeds', async () => {
        await blameFile('path/to my files/test.txt');

        sinon.assert.calledWithExactly(commandStub, `git blame --porcelain \"test.txt\"`, `path/to my files/`);
    });

    test('test blameFile path and filename with space succeeds', async () => {
        await blameFile('path/to my files/test this.txt');

        sinon.assert.calledWithExactly(commandStub, `git blame --porcelain \"test this.txt\"`, `path/to my files/`);
    });

    test('test blameFile ignore white space from settings succeeds', async () => {
        settingsIgnoreWhiteSpaceStub.returns(true);

        await blameFile('dev/index.ts');

        sinon.assert.calledWithExactly(commandStub, `git blame -w --porcelain "index.ts"`, "dev/");
    });

    test('test blameFile ignore white space toggle succeeds', async () => {
        stateStub.returns(true);

        await blameFile('dev/home.ts');

        sinon.assert.calledWithExactly(commandStub, `git blame -w --porcelain "home.ts"`, "dev/");
    });
});
