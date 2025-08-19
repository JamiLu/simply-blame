/**
 * License GPL-2.0
 */
import * as assert from 'assert';
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as blameMock from '../../Blame';
import * as git from '../../Git';
import Settings from '../../Settings';
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
        // foobar
14728a3afb0871ac18e84d4d3e41bd34f0283176 2 7
author Testing Tester TT
author-mail <test@example.com>
author-time 1743513058
summary This is a test commit message
filename src/test.ts
        // foobar
14728a3afb0871ac18e84d4d3e41bd34f0283172 2 8
        second edit
14728a3afb0871ac18e84d4d3e41bd34f0283172 2 9
        third edit
14728a3afb0871ac18e84d4d3e41bd34f0283172 2 10
        fourth edit`;

suite('Test Blame', () => {

    let gitMock: sinon.SinonMock;

    mocha.before(async () => {
        await activateExtension();
    });

    mocha.beforeEach(() => {
        gitMock = sinon.mock(git);
    });

    mocha.afterEach(() => {
        gitMock.restore();
    });

    const uniqueCommits = (blamed: blameMock.BlamedDocument[]) => {
        return blamed.reduce((total: blameMock.BlamedDocument[], current: blameMock.BlamedDocument) => {
            if (!total.find(t => t.hash === current.hash)) {
                total.push(current);
            }
            return total;
        }, []);
    };

    test('test blame function', async () => {
        const settings = sinon.stub(Settings, 'getAuthorStyle').returns('full');
        gitMock.expects('blameFile').returns(getBlame());

        const blamed = await blameMock.blame(document);

        const first = blamed[0];
        
        assert.strictEqual(first.author.displayName, 'Jami Lu');
        assert.strictEqual(first.linenumber, '1');
        assert.strictEqual(first.email, 'test@example.com');
        assert.strictEqual(first.summary, 'This is a test commit message');
        assert.strictEqual(first.hash, '14728a3afb0871ac18e84d4d3e41bd34f0283170');
        assert.strictEqual(first.date.dateString, '2024417');
        assert.strictEqual(first.filename, 'src/test.ts');
        assert.ok(first.codeline.includes('import * as vscode from "vscode"'));
        assert.strictEqual(blamed[1].author.displayName, 'über D.ber');
        assert.ok(blamed[1].codeline.includes('// foobar'));
        assert.strictEqual(blamed[2].author.displayName, '李 连杰');
        assert.strictEqual(blamed[3].author.displayName, 'שלום שלום');
        assert.strictEqual(blamed[4].author.displayName, 'r/a\\b test');
        assert.strictEqual(blamed[5].author.displayName, '&%¤#"!?=(){}[]/\\');
        assert.strictEqual(blamed[6].author.displayName, 'Testing Tester TT');
        assert.strictEqual(blamed[7].author.displayName, '李 连杰');
        assert.strictEqual(blamed[8].author.displayName, '李 连杰');
        assert.strictEqual(blamed[9].author.displayName, '李 连杰');
        assert.strictEqual(blamed.length, 10);
        assert.strictEqual(uniqueCommits(blamed).length, 7);

        settings.restore();
    });

    test('test blame annotation first name', async () => {
        const settings = sinon.stub(Settings, 'getAuthorStyle').returns('first');
        gitMock.expects('blameFile').returns(getBlame());

        const blamed = await blameMock.blame(document);

        assert.strictEqual(blamed[0].author.displayName, 'Jami');
        assert.strictEqual(blamed[1].author.displayName, 'über');
        assert.strictEqual(blamed[2].author.displayName, '李');
        assert.strictEqual(blamed[3].author.displayName, 'שלום');
        assert.strictEqual(blamed[4].author.displayName, 'r/a\\b');
        assert.strictEqual(blamed[5].author.displayName, '&%¤#"!?=(){}[]/\\');
        assert.strictEqual(blamed[6].author.displayName, 'Testing Tester');
        assert.strictEqual(blamed[7].author.displayName, '李');
        assert.strictEqual(blamed[8].author.displayName, '李');
        assert.strictEqual(blamed[9].author.displayName, '李');
        assert.strictEqual(blamed.length, 10);
        assert.strictEqual(uniqueCommits(blamed).length, 7);

        settings.restore();
    });

    test('test blame annotation last name', async () => {
        const settings = sinon.stub(Settings, 'getAuthorStyle').returns('last');
        gitMock.expects('blameFile').returns(getBlame());

        const blamed = await blameMock.blame(document);

        assert.strictEqual(blamed[0].author.displayName, 'Lu');
        assert.strictEqual(blamed[1].author.displayName, 'D.ber');
        assert.strictEqual(blamed[2].author.displayName, '连杰');
        assert.strictEqual(blamed[3].author.displayName, 'שלום');
        assert.strictEqual(blamed[4].author.displayName, 'test');
        assert.strictEqual(blamed[5].author.displayName, '&%¤#"!?=(){}[]/\\');
        assert.strictEqual(blamed[6].author.displayName, 'TT');
        assert.strictEqual(blamed[7].author.displayName, '连杰');
        assert.strictEqual(blamed[8].author.displayName, '连杰');
        assert.strictEqual(blamed[9].author.displayName, '连杰');
        assert.strictEqual(blamed.length, 10);
        assert.strictEqual(uniqueCommits(blamed).length, 7);

        settings.restore();
    });
});
