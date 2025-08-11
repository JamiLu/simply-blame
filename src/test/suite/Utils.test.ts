/**
 * License GPL-2.0
 */
import * as assert from 'assert';
import { getLocation } from '../../Utils';

suite('Test Utils', () => {

    test('test get location unix path', () => {
        const location = getLocation('/test/path/to/file.ts');
        assert.strictEqual(location, '/test/path/to/');
    });

    test('test get location windows path', () => {
        const location = getLocation('\\test\\path\\to\\file.ts');
        assert.strictEqual(location, '\\test\\path\\to\\');
    });
});
