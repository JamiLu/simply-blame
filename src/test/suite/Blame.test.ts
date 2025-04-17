import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as blameMock from '../../Blame';
import Notifications from '../../Notifications';
import { activateExtension, document } from './helpers';

export const getBlame = () => `14728a3afb0871ac18e84d4d3e41bd34f0283170 1 1 3
author Jami Lu
author-mail <test@example.com>
author-time 1715896852
summary This is a test commit message
filename src/test.ts
        import * as vscode from "vscode";
14728a3afb0871ac18e84d4d3e41bd34f0283171 2 2
author über D.ber
author-mail <test@example.com>
author-time 1743945058
summary This is a test commit message
filename src/test.ts
        // foobar;
14728a3afb0871ac18e84d4d3e41bd34f0283172 2 3
author 李 连杰
author-mail <test@example.com>
author-time 1743858658
summary This is a test commit message
filename src/test.ts
        // foobar;
14728a3afb0871ac18e84d4d3e41bd34f0283173 2 4
author שלום שלום
author-mail <test@example.com>
author-time 1743685858
summary This is a test commit message
filename src/test.ts
        // foobar
14728a3afb0871ac18e84d4d3e41bd34f0283174 2 5
author r/a\\b test
author-mail <test@example.com>
author-time 1743599458
summary This is a test commit message
filename src/test.ts
        // foobar
14728a3afb0871ac18e84d4d3e41bd34f0283175 2 6
author &%¤#"!?=(){}[]/\\
author-mail <test@example.com>
author-time 1743513058
summary This is a test commit message
filename src/test.ts
        // foobar`;

suite('Test Blame', () => {

    let mock: sinon.SinonMock;

    mocha.before(async () => {
        await activateExtension();
    });

    mocha.beforeEach(() => {
        mock = sinon.mock(blameMock);
    });

    mocha.afterEach(() => {
        mock.restore();
    });

    test('test blameFile throws git not found git not found notification shown', async () => {
        const gitNotFoundNotificationSpy = sinon.spy(Notifications, 'gitNotFoundNotification');
        const stub = sinon.stub(blameMock, 'promiseExec').throwsException(new Error('git: not found'));

        await blameMock.blameFile('test.txt');        
        
        assert.ok(gitNotFoundNotificationSpy.calledOnce);
        stub.restore();
        gitNotFoundNotificationSpy.restore();
    });

    test('test blameFile throws error common notification is shown', async () => {
        const commonNotificationSpy = sinon.spy(Notifications, 'commonErrorNotification');
        const stub = sinon.stub(blameMock, 'promiseExec').throwsException(new Error('something happened'));

        await blameMock.blameFile('test.txt');

        assert.ok(commonNotificationSpy.calledOnce);
        stub.restore();
        commonNotificationSpy.restore();
    });

    test('test blameFile slash succeeds', async () => {
        const spy = sinon.spy(blameMock, 'promiseExec');

        await blameMock.blameFile('path/to/file/test.ts');
        
        assert.ok(spy.calledWith(`cd path/to/file/ && git blame --line-porcelain test.ts`));
        spy.restore();
    });

    test('test blameFile backslash succeeds', async () => {
        const spy = sinon.spy(blameMock, 'promiseExec');

        await blameMock.blameFile('path\\to\\file\\test.ts');

        assert.ok(spy.calledWith('cd path\\to\\file\\ && git blame --line-porcelain test.ts'));
        spy.restore();
    });

    test('test blameFile filename with dash succeeds', async () => {
        const spy = sinon.spy(blameMock, 'promiseExec');

        await blameMock.blameFile('path/to/file/test-this.txt');

        assert.ok(spy.calledWith(`cd path/to/file/ && git blame --line-porcelain test-this.txt`));
        spy.restore();
    });

    test('test blame function', async () => {
        mock.expects('blameFile').returns(getBlame());

        const blamed = await blameMock.blame(document);

        const first = blamed[0];

        console.log(new Date().getTimezoneOffset());
        
        assert.strictEqual(first.author, 'Jami Lu');
        assert.strictEqual(first.linenumber, '1');
        assert.strictEqual(first.email, 'test@example.com');
        assert.strictEqual(first.summary, 'This is a test commit message');
        assert.strictEqual(first.hash, '14728a3afb0871ac18e84d4d3e41bd34f0283170');
        assert.strictEqual(first.date.dateString, '2024417');
        assert.strictEqual(first.filename, 'src/test.ts');
        assert.ok(first.codeline.includes('import * as vscode from "vscode"'));
        assert.strictEqual(blamed[1].author, 'über D.ber');
        assert.ok(blamed[1].codeline.includes('// foobar'));
        assert.strictEqual(blamed[2].author, '李 连杰');
        assert.strictEqual(blamed[3].author, 'שלום שלום');
        assert.strictEqual(blamed[4].author, 'r/a\\b test');
        assert.strictEqual(blamed[5].author, '&%¤#"!?=(){}[]/\\');
        assert.strictEqual(6, blamed.length);
    });
});
