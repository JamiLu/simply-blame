/**
 * License GPL-2.0
 */
import * as mocha from 'mocha';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { getCommitMessage } from '../../Git';
import { activateExtension, createMockBlame, document } from './helpers';
import * as cmdMock from '../../Command';
import { getLocation } from '../../Utils';

suite('Test Git commands', () => {

    const blame = createMockBlame(10, new Date(2025, 2, 10)); // 10th March 2025

    let commandStub: sinon.SinonStub;

    mocha.before(async () => {
        await activateExtension();
        commandStub = sinon.stub(cmdMock, 'command');
    });

    mocha.after(() => {
        commandStub.restore();
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

        sinon.assert.calledWithExactly(commandStub, `cd ${getLocation(document.fileName)} && git show a`);

        assert.strictEqual(message, `

This is a commit title
This is a commit body message. Which is a long text that describes the commit. I have to think hard to figure out what to write here since this is important for the others to know what has been done in this particular commit.

Few points about this commit:
* There was a variable called foobar that was declared
* A keyword var was used to declare the variable foobar
* The const or the let keywords could have been used instead due it is more advanced

Maybe this commit message is long and descriptive enough to prove a point.

`);
    });
});
