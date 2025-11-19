/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import * as decorationUtils from '../../DecorationUtils';
import { createMockBlamedDocument } from './helpers';
import { emptyBlame } from '../../Blame';
import BlameManager from '../../BlameManager';

suite('Test DecorationUtils', () => {

    const blamedDocument = createMockBlamedDocument();
    const blameManager = new BlameManager();
    const mockDecorationWidth = sinon.stub(blameManager, 'decorationWidth');
    const mockGetBlameColor = sinon.stub(blameManager, 'getBlameColor');
    const gray = '#CCEECC';

    mocha.after(() => {
        mockDecorationWidth.restore();
        mockGetBlameColor.restore();
    });

    test('test calculate decorations width', () => {
        const width = decorationUtils.calculateDecorationsWidth(blamedDocument);

        assert.ok(width !== '25px', 'Width should be more than 25px');
    });

    test('test get decorations for blame', () => {
        mockDecorationWidth.returns(decorationUtils.DEFAULT_WIDTH);
        mockGetBlameColor.returns(gray);
        const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
        const [name, date] = decorationUtils.getDecorations(range, blamedDocument[0], blameManager);

        assertContentText(name.renderOptions?.before?.contentText);
        assert.strictEqual(name.renderOptions?.before?.width, decorationUtils.DEFAULT_WIDTH);
        assert.strictEqual(name.renderOptions.before.backgroundColor, gray);

        assertContentText(date.renderOptions?.before?.contentText);
        assert.ok(date.renderOptions?.before?.width === undefined, 'Expected undefined width');
        assert.strictEqual(date.renderOptions?.before?.backgroundColor, gray);
    });

    test('test get deorations for empty blame', () => {
        mockDecorationWidth.returns(decorationUtils.DEFAULT_WIDTH);
        const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
        const [name, date] = decorationUtils.getDecorations(range, emptyBlame(), blameManager);

        assertContentText(name.renderOptions?.before?.contentText);
        assert.strictEqual(name.renderOptions?.before?.width, decorationUtils.DEFAULT_WIDTH);
        assert.ok(name.renderOptions?.before?.backgroundColor === undefined, 'Expected undefined background color');

        assertContentText(date.renderOptions?.before?.contentText);
        assert.ok(date.renderOptions?.before?.width === undefined, 'Expected undefined width');
        assert.ok(date.renderOptions?.before?.backgroundColor === undefined, 'Expected background color to be undefined');
    });

    test('test create normal message summary', () => {
        const msg = decorationUtils.createNormalMessage(blamedDocument[0]);

        assert.match(msg.value, /\$\(account\)/);
        assert.match(msg.value, /\$\(mail\)/);
        assert.match(msg.value, /\$\(calendar\)/);
        assert.match(msg.value, /\$\(copy\)/);
        assert.match(msg.value, /generated$/, `Expected the message to end with the text: "generated"`);
    });

    test('test create normal message with full message', () => {
        const fullMsg = 'This is a full body message title\n\nThis is a chapter one.';
        const msgWords = fullMsg.replace(/\n+/, ' ').split(' ');
        const msg = decorationUtils.createNormalMessage(blamedDocument[0], 'This is a full body message title\n\nThis is a chapter one.');

        assert.match(msg.value, /\$\(account\)/);
        assert.match(msg.value, /\$\(mail\)/);
        assert.match(msg.value, /\$\(calendar\)/);
        assert.match(msg.value, /\$\(copy\)/);
        assert.doesNotMatch(msg.value, /generated$/);
        msgWords.forEach(word => assert.ok(msg.value.includes(word)));
        assert.match(msg.value, new RegExp(`${msgWords.at(-1)}$`), `Expected the message to end with the last word "${msgWords.at(-1)}"`);
    });

    test('test create minimal message', () => {
        const msg = decorationUtils.createMinimalMessage(blamedDocument[0]);

        assert.match(msg.value, /\(command:/);
        assert.match(msg.value, /generated$/, `Expected the message to end with the text: "generated"`);
        assert.doesNotMatch(msg.value, /\$\(account\)/);
        assert.doesNotMatch(msg.value, /\$\(mail\)/);
        assert.doesNotMatch(msg.value, /\$\(calendar\)/);
        assert.doesNotMatch(msg.value, /\$\(copy\)/);
    });

    function assertContentText(contentText?: string) {
        assert.ok(contentText !== undefined, 'Expected content text to have length, is undefined');
        assert.match(contentText, /\s+/);
    }

});
