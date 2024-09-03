import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as blameMock from '../../Blame';
import Notifications from '../../Notifications';
import { activateExtension, document } from './helpers';

export const getBlame = () => `2efb8e96 (Jami Lu 2019-02-19 14:07:41 +0200   1) import Util from '../util';
23c950bc (Matti Testaaja 2023-05-24 00:54:15 +0300   2) import Browser from '../browser';
60bd85e1 (Matti Testaaja 2019-03-21 22:57:08 +0200   3) import Renderer from './renderer';
3e195561 (VilleViisi  2023-05-24 22:48:51 +0300   4) import Resolver from '../template';
2efb8e96 ( JuusoJuustonperä 2019-02-19 14:07:41 +0200   5) import Tree from '../tree';
946b3e4c ( EetuEe 2023-05-18 21:36:21 +0300   6) import Manager from './manager';
66d808fe (AatuAA  2023-07-16 00:51:14 +0300   7) import Element from '../template/Element';
1e835440 (Jami Lu 2022-04-13 02:00:33 +0300   8) import Helper from '../template/fragment';
946b3e4c (Maija Mäkelä 2023-05-18 21:36:21 +0300   9) import { ready } from '../ready';
2efb8e96 (Yrjö Ylpå 2019-02-19 14:07:41 +0200  10) 
1acec2d483a (makeaü        2023-06-08 13:56:11 +0300  85)   };
0d845391928 src/components/testi.tsx                    (foobar1^      2023-03-24 13:02:47 +0200  847)           }}
4f559dbb425 src/components/testi.tsx (testitestaaja         2020-08-28 16:36:10 +0300  787)   );
808d23637d7 src/components/testi.tsx (sheikki1        2021-09-08 17:16:51 +0530  789)   React.useEffect(() => {
34e8cfc5ba9 src/components/testi.tsx (mantelikakku      2021-08-02 15:12:15 +0530  785)       )}
34e8cfc5ba9 src/components/testi.tsx (pa a lasse      2021-08-02 15:12:15 +0530  785)       )}
343abc32 src/components/testi.tsx (Pa. Lasse Yli-vainio      2021-08-02 15:12:15 +0530  785)       )}
34e8cfc5ba9 src/components/testi.tsx (make  8.    2021-08-02 15:12:15 +0530  785)       )}
1e835440 (李 连杰 2022-04-13 02:00:33 +0300   8) import Helper from '../template/fragment';
1e835440 (你好 2022-04-13 02:00:33 +0300   8) import Helper from '../template/fragment';
3e195561 (שלוםV   2023-05-24 22:48:51 +0300   4) import Resolver from '../template';
3e195561 (שלום   2023-05-24 22:48:51 +0300   4) import Resolver from '../template';
3e195561 (שלום שלום   2023-05-24 22:48:51 +0300   4) import Resolver from '../template';
^d23637d7 src/components/testi.tsx (abc        2021-09-08 17:16:51 +0530  789)   React.useEffect(() => {
cf3a0b5355c6 (Colin Cross     2017-11-16 00:15:28 -0800 19) `;

export const getErrornousBlame = () => `34e8cfc5ba9 src/components/testi.tsx (pa a lasse      2021-08-02 15:12:15 +0530  785)       )}
343abc32 src/components/testi.tsx (aa ()/f      2021-08-02 15:12:15 +0530  785)       )}
34e8cfc5ba9 src/components/testi.tsx (make  8.    2021-08-02 15:12:15 +0530  785)       )}`;

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
        
        assert.ok(spy.calledWith(`cd path/to/file/ && git blame test.ts`));
        spy.restore();
    });

    test('test blameFile backslash succeeds', async () => {
        const spy = sinon.spy(blameMock, 'promiseExec');

        await blameMock.blameFile('path\\to\\file\\test.ts');

        assert.ok(spy.calledWith('cd path\\to\\file\\ && git blame test.ts'));
        spy.restore();
    });

    test('test blameFile filename with dash succeeds', async () => {
        const spy = sinon.spy(blameMock, 'promiseExec');

        await blameMock.blameFile('path/to/file/test-this.txt');

        assert.ok(spy.calledWith(`cd path/to/file/ && git blame test-this.txt`));
        spy.restore();
    });
    
    test('test blame function', async () => {
        mock.expects('blameFile').returns(getBlame());

        const blamed = await blameMock.blame(document);

        assert.strictEqual(blamed[0].author, 'Jami Lu');
        assert.strictEqual(blamed[1].author, 'Matti Testaaja');
        assert.strictEqual(blamed[3].author, 'VilleViisi');
        assert.strictEqual(blamed[4].author, 'JuusoJuustonperä');
        assert.strictEqual(blamed[5].author, 'EetuEe');
        assert.strictEqual(blamed[6].author, 'AatuAA');
        assert.strictEqual(blamed[8].author, 'Maija Mäkelä');
        assert.strictEqual(blamed[9].author, 'Yrjö Ylpå');
        assert.strictEqual(blamed[10].author, 'makeaü');
        assert.strictEqual(blamed[11].author, 'foobar1^');
        assert.strictEqual(blamed[12].author, 'testitestaaja');
        assert.strictEqual(blamed[13].author, 'sheikki1');
        assert.strictEqual(blamed[14].author, 'mantelikakku');
        assert.strictEqual(blamed[15].author, 'pa a lasse');
        assert.strictEqual(blamed[16].author, 'Pa. Lasse Yli-vainio');
        assert.strictEqual(blamed[17].author, 'make  8.');
        assert.strictEqual(blamed[18].author, '李 连杰');
        assert.strictEqual(blamed[19].author, '你好');
        assert.strictEqual(blamed[20].author, 'שלוםV');
        assert.strictEqual(blamed[21].author, 'שלום');
        assert.strictEqual(blamed[22].author, 'שלום שלום');
        assert.strictEqual(blamed[23].author, 'abc');
        assert.strictEqual(blamed[24].author, 'Colin Cross');
        assert.strictEqual(25, blamed.length);
    });

    test('test blame function fails notification is shown', async () => {
        const notificationSpy = sinon.spy(Notifications, 'parsingBlameFailed');
        mock.expects('blameFile').returns(getErrornousBlame());

        const blamed = (await blameMock.blame(document)).filter(Boolean);

        assert.ok(notificationSpy.calledOnce);
        assert.strictEqual(2, blamed.length);
        notificationSpy.restore();
    });
});
