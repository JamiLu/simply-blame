/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as mocha from 'mocha';
import { activateExtension, mockActiveEditor } from './helpers';
import EditorManager from '../../Editor';

const editorManagerInstance = EditorManager.getInstance();

suite('Test Editor Manager', () => {

    const activeEditorMock = mockActiveEditor();

    mocha.before(async () => {
        await activateExtension();
    });

    mocha.beforeEach(() => {
        activeEditorMock.mock();
    });

    mocha.afterEach(() => {
        activeEditorMock.restore();
    });

    test('test toggle blame should set current', () => {
        assert.ok(editorManagerInstance.currentEditor === null, 'editorManager.currentEditor is not null');

        editorManagerInstance.toggleEditor(vscode.window.activeTextEditor!);

        assert.ok(editorManagerInstance.currentEditor !== null, 'editorManager.currentEditor is null');
    });

});