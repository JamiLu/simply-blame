import * as vscode from 'vscode';
import HeatMapManager from './HeatMapManager';
import { BlamedDocument, blame, blameFile } from './Blame';
import { getFilename } from './Utils';

type BlameDecoration = [vscode.ThemableDecorationAttachmentRenderOptions?, vscode.ThemableDecorationAttachmentRenderOptions?, vscode.MarkdownString?];

class BlameManager {

    private isOpen: boolean = false;
    private blamedDocument: BlamedDocument[] = [];
	private heatMapManager = new HeatMapManager();
    private nameRoot: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
		dark: {
			color: new vscode.ThemeColor('editor.foreground')
		},
		light: {
			color: '#000000'
		},
		before: {
			color: new vscode.ThemeColor('editor.foreground'),
			height: 'editor.lineHeight',
		}
	});
	private dateRoot: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
		dark: {
			color: new vscode.ThemeColor('editor.foreground')
		},
		light: {
			color: '#000000'
		},
		before: {
			color: new vscode.ThemeColor('editor.foreground'),
			height: 'editor.lineHeight',
			margin: '0 10px 0 0',
		}
	});

    async toggleBlame(editor: vscode.TextEditor) {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            this.blamedDocument = await blame(editor.document);
			if (this.blamedDocument.length > 0) {
				this.heatMapManager.indexHeatMap(this.blamedDocument);

				const [decorations, dateDeco] = this.getBlamedDecorations(editor.document);
				editor.setDecorations(this.nameRoot, decorations);
				editor.setDecorations(this.dateRoot, dateDeco);
			} else {
				this.isOpen = false;
			}
        } else {
            editor.setDecorations(this.nameRoot, []);
			editor.setDecorations(this.dateRoot, []);
        }
    }

	refresh() {
		if (this.isOpen) {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				this.heatMapManager.refreshColors();
				this.heatMapManager.indexHeatMap(this.blamedDocument);
				const [name, date] = this.getBlamedDecorations(editor.document);
				editor.setDecorations(this.nameRoot, name);
				editor.setDecorations(this.dateRoot, date);
			}
		}
	}

	closeBlame() {
		this.isOpen = false;
		const editor = vscode.window.activeTextEditor;
		editor?.setDecorations(this.nameRoot, []);
		editor?.setDecorations(this.dateRoot, []);
	}

	async openBlameEditor(editor: vscode.TextEditor) {
		const blamedContent = await blameFile(editor.document.fileName);

		const panel = vscode.window.createWebviewPanel('blame', `Blame - ${getFilename(editor.document.uri.path)}`, vscode.ViewColumn.Beside);

		panel.webview.html = this.getHtmlForEditor(blamedContent);
	}

	private getHtmlForEditor(content: string) {
		return `<!DOCTYPE html>
<html>
	<body>
		<div style="white-space: pre">
${content}
		</div>
	<body>
</html>`;
	}

	private createDecorations(lineIdx: number, contentLineDefaultLength: number): BlameDecoration {
		const blamedDocument = this.blamedDocument[lineIdx];

		if (blamedDocument) {
			return [
				{
					contentText: `\u2003${blamedDocument.author}`,
					backgroundColor: this.heatMapManager.getHeatColor(blamedDocument.date),
					width: `${contentLineDefaultLength * 10 + 40}px`
				},
				{
					contentText: `${blamedDocument.date.localDate}\u2003`,
					backgroundColor: this.heatMapManager.getHeatColor(blamedDocument.date),
				},
				new vscode.MarkdownString(`### ${blamedDocument.hash}`)	
			];
		} else if (this.blamedDocument.length - 1 <= lineIdx) {
			return [];
		} else {
			return [
				{
					contentText: `\u2003parsing failed\u2003`,
					backgroundColor: new vscode.ThemeColor('editor.background'),
					width: `${contentLineDefaultLength * 10 + 40}px`
				}
			];
		}
	}

	private getBlamedDecorations(document: vscode.TextDocument) {

			const nameDecorations: vscode.DecorationOptions[] = [];

			const dateDecorations: vscode.DecorationOptions[] = [];

			const linecount = document.lineCount || 0;

			const longestAuthor = this.blamedDocument.filter(Boolean).map(line => line.author.length).reduce((prev, curr) => prev > curr ? prev : curr, 10);

			if (this.blamedDocument.length > 0) {
				for (let i = 0; i < linecount; i++) {
					const startPos = new vscode.Position(i, 0);
					const endPos = new vscode.Position(i, 0);
					let range = new vscode.Range(startPos, endPos);

					const [name, date, hoverMessage] = this.createDecorations(i, longestAuthor);
					
					nameDecorations.push({
						range,
						renderOptions: {
							before: name
						},
						hoverMessage: hoverMessage
					});

					dateDecorations.push({
						range,
						renderOptions: {
							before: date
						},
					});
				}
			}

			return [nameDecorations, dateDecorations];
	};
}

export default BlameManager;
