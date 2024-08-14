import * as vscode from 'vscode';
import { BlamedDocument, blame, blameFile } from './Blame';
import { IndexedHeatMap, getHeatColor, indexHeatColors } from './HeatMap';

class BlameManager {

    private isOpen: boolean = false;
    private blamedDocument: BlamedDocument[] = [];
    private heatMap: IndexedHeatMap = {};
    private decorationRoot: vscode.TextEditorDecorationType = vscode.window.createTextEditorDecorationType({
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
				this.heatMap = indexHeatColors(this.blamedDocument);

				const decorations = await this.getBlamedDecorations(editor.document);
				editor.setDecorations(this.decorationRoot, decorations);

				vscode.workspace.onDidChangeTextDocument(() => {
					if (this.isOpen) {
						editor.setDecorations(this.decorationRoot, decorations);
					}
				});
			} else {
				this.isOpen = false;
			}
        } else {
            editor.setDecorations(this.decorationRoot, []);
        }
    }

	closeBlame() {
		this.isOpen = false;
	}

	async openBlameEditor(editor: vscode.TextEditor) {
		const blamedContent = await blameFile(editor.document.fileName);

		const panel = vscode.window.createWebviewPanel('blame', `Blame - ${this.getFilename(editor.document)}`, vscode.ViewColumn.Beside);

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

	private getFilename(document: vscode.TextDocument) {
		return document.uri.path.substring(document.uri.path.lastIndexOf('/'));
	}

    private createContentLine(author: string, date: string, defaultLength: number) {
		const maxLength = defaultLength + 16;
		let line = `\u2003${author}_${date}\u2003`;
		const multiplier = maxLength - line.length;
		
		let space = '';
		for (let i = 0; i < multiplier; i++) {
			space += '\u2003';
		}
		
		line = line.replace('_', space);

		return line;
	};

	private createDecorations(lineIdx: number, contentLineDefaultLength: number) {
		const blamedDocument = this.blamedDocument[lineIdx];

		if (blamedDocument) {
			return [
				{
					contentText: this.createContentLine(blamedDocument.author, blamedDocument.date.localDate, contentLineDefaultLength),
					backgroundColor: getHeatColor(blamedDocument.date, this.heatMap)
				},
				new vscode.MarkdownString(`### ${blamedDocument.hash}`)	
			];
		} else if (this.blamedDocument.length - 1 === lineIdx) {
			return [];
		} else {
			return [
				{
					contentText: this.createContentLine('parsing failed', '', contentLineDefaultLength),
					backgroundColor: new vscode.ThemeColor('editor.background')
				},
				undefined
			];
		}
	}

	private async getBlamedDecorations(document: vscode.TextDocument) {

			const decorations: vscode.DecorationOptions[] = [];

			const linecount = document.lineCount || 0;

			const longestAuthor = this.blamedDocument.filter(Boolean).map(line => line.author.length).reduce((prev, curr) => prev > curr ? prev : curr, 0);

			if (this.blamedDocument.length > 0) {
				for (let i = 0; i < linecount; i++) {
					const startPos = new vscode.Position(i, 0);
					const endPos = new vscode.Position(i, 0);
					let range = new vscode.Range(startPos, endPos);

					const [decorationOptions, hoverMessage] = this.createDecorations(i, longestAuthor);
	
					decorations.push({
						range,
						renderOptions: {
							before: decorationOptions as vscode.ThemableDecorationAttachmentRenderOptions
						},
						hoverMessage: hoverMessage as vscode.MarkdownString
					});
				}
			}

			return decorations;
	};
}

export default BlameManager;
