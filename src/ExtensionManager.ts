/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import Settings from './Settings';
import { hashAction } from './HashAction';
import BlameHoverProvider from './BlameHoverProvider';
import EditorManager, { openBlameEditor } from './Editor';

class ExtensionManager {

    private static instance: ExtensionManager;

    private context: vscode.ExtensionContext;
    private editorManager = EditorManager.getInstance();
    private blameHoverProvider: BlameHoverProvider;
    private sbStatus: vscode.StatusBarItem;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.blameHoverProvider = new BlameHoverProvider();
        this.sbStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.sbStatus.show();
    }

    static setBusy(busy: boolean) {
        if (busy) {
            this.instance.sbStatus.text = 'Simply Blame $(loading~spin)';
        } else {
            this.instance.sbStatus.text = 'Simply Blame';
        }
    }

    registerCommands() {
        const debugCommand = vscode.commands.registerTextEditorCommand('simply-blame.openBlameInEditorDebugCommand', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
            await openBlameEditor(textEditor);
        });

        const blameCommand = vscode.commands.registerTextEditorCommand('simply-blame.simplyBlame', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) => {
            await this.editorManager.toggleEditor(textEditor);
        });

        const hashActionCommand = vscode.commands.registerCommand('simply-blame.hashAction', async ({ hash }: any) => {
            await hashAction(hash);
        });

        const hoverProvider = vscode.languages.registerHoverProvider({ scheme: 'file' }, this.blameHoverProvider);

        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration(Settings.config)) {
                this.editorManager.currentEditor.refresh();
                this.blameHoverProvider.refresh();
            }
        });

        vscode.window.onDidChangeActiveTextEditor((editor?: vscode.TextEditor) => {
            this.editorManager.changeEditor(editor);
        });

        vscode.window.onDidChangeActiveColorTheme(() => {
            this.editorManager.currentEditor.refresh();
        });

        vscode.workspace.onDidChangeTextDocument((event) => {
            if (event.document.isDirty) {
                this.editorManager.currentEditor.refresh(event);
            }
        });

        vscode.workspace.onDidCloseTextDocument((document: vscode.TextDocument) => {
            this.editorManager.closeEditor(document);
        });

        this.context.subscriptions.push(debugCommand, blameCommand, hashActionCommand, this.sbStatus, hoverProvider);
    }

    static getInstance(context: vscode.ExtensionContext) {
        if (!this.instance) {
            this.instance = new ExtensionManager(context);
        }
        return this.instance;
    }
}

export default ExtensionManager;
