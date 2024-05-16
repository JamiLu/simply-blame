// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ExtensionManager from './ExtensionManager';



/**
 *  TODO
 * 
 *  - clean the code OK
 *  - write more tests OK
 *    - for heat map OK
 *    - error occurs during blame show notification OK
 *  - create repo
 *  - publish to store
 */


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const extensionManager = ExtensionManager.getInstance(context);

	extensionManager.registerCommands();
	
	// let toggleBlame = false;

	// let blamedDocument: BlamedDocument[];

	// let indexedHeatMap: IndexedHeatMap;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "git-blame" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// let disposable = vscode.commands.registerCommand('git-blame.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed
	// 	// Display a message box to the userh
	// 	vscode.window.showInformationMessage("Hello herer");


	// 	// const git = vscode.scm.createsSourceControl('git', 'Git');



	// });


	// vscode.languages.registerCodeLensProvider("*", new BlameLensProvider(toggleBlame));


// 	const decorationType = vscode.window.createTextEditorDecorationType({
// 		// backgroundColor: vscode.ThemeColor,
// 		// color: 'red'
// 		rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
// 		cursor: 'pointer',
// 	});


// 	const getHtmlForBlame = (content: String) => {

// 		return `<!DOCTYPE html>
// <html>
// 	<body>
// 		<div style="white-space: pre">
// ${content}
// 		</div>
// 	<body>
// </html>`;
// 	};

// 	const createContentLine = (author: string, date: string, defaultLength: number) => {
// 		const maxLength = defaultLength + 16;
// 		let line = `\u2003${author}_${date}\u2003`;
// 		const multiplier = maxLength - line.length;
		
// 		let space = '';
// 		for (let i = 0; i < multiplier; i++) {
// 			space += '\u2003';
// 		}

		
// 		line = line.replace('_', space);


// 		return line;
// 	};

// 	const getBlamedDecorations = async (document: vscode.TextDocument) => {

// 			const decorations: vscode.DecorationOptions[] = [];

// 			const linecount = document.lineCount || 0;

// 			const longestAuthor = blamedDocument.map(line => line.author.length).reduce((prev, curr) => prev > curr ? prev : curr);

// 			if (blamedDocument.length > 0) {
// 				for (let i = 0; i < linecount - 1; i++) {
// 					const startPos = new vscode.Position(i, 0);
// 					const endPos = new vscode.Position(i, 0);
// 					let range = new vscode.Range(startPos, endPos);
	
// 					// const content = i + 1 === Number(blamedDocument[i].linenumber) ? ` ${blamedDocument[i].hash} ${blamedDocument[i].date} ${blamedDocument[i].author} ` : '    ';
	
// 					decorations.push({
// 						range,
// 						renderOptions: {
// 							before: {
// 								color: new vscode.ThemeColor('editor.foreground'),
// 								contentText: createContentLine(blamedDocument[i].author, blamedDocument[i].date.localDate, longestAuthor),// ` ${blamedDocument[i].author} ${blamedDocument[i].date.localDate} `,
// 								height: 'editor.lineHeight',
// 								// width: '300px',
// 								// textDecoration: 'dotted',
// 								margin: '0 10px 0 0',
// 								backgroundColor: getHeatColor(blamedDocument[i].date, indexedHeatMap)
// 							},
// 							// after: {
// 							// 	color: new vscode.ThemeColor('editor.foreground'),
// 							// 	contentText: `${blamedDocument[i].date.localDate} `,
// 							// 	width: '300px',
// 							// 	margin: '0px 20px 0px 20px',
// 							// 	textDecoration: 'underline'

// 							// }
// 						},
// 						hoverMessage: new vscode.MarkdownString(`### ${blamedDocument[i].hash}`)
// 					});
// 				}
// 			}

// 			return decorations;
// 	};

// 	interface Decs {
// 		range: vscode.Range;
// 		text: string;
// 	}

// 	const getCoolDecorations = async (lineCount: number) => {

// 		const decs: Decs[] = [];

// 		for (let i = 0; i < lineCount - 1; i++) {
// 			const startPos = new vscode.Position(i, 0);
// 			const endPos = new vscode.Position(i, 0);
// 			let range = new vscode.Range(startPos, endPos);


// 			decs.push({
// 				range,
// 				text: ` ${blamedDocument[i].hash} ${blamedDocument[i].date.dateString} ${blamedDocument[i].author} `,
// 			});
// 		}

// 		return decs;
// 	};

// 	let helloWorld = vscode.commands.registerTextEditorCommand('simply-blame.helloWorld', 
// 		async (textEditor: vscode.TextEditor, textEditorEdit: vscode.TextEditorEdit) => {
		

// 		const file = textEditor.document.fileName;

// 		// console.log('testi', file);

// 		// vscode.window.showInformationMessage('Hello File  ' + file);

// 		// const e = await blame(textEditor.document);
// 		// console.log(e);
		
// 		const blamed = await blameFile(file);

// 		const panel = vscode.window.createWebviewPanel('blame', 'Blame', vscode.ViewColumn.Three, {});

// 		panel.webview.html = getHtmlForBlame(blamed);
// 	});

	// let simplyBlame = vscode.commands.registerTextEditorCommand('simply-blame.simplyBlame', async () => {

	// 	toggleBlame = !toggleBlame;

	// 	console.log('simply blame');

	// 	const editor = vscode.window.activeTextEditor;

	// 	if (toggleBlame) {

	// 		blamedDocument = await blame(editor?.document!);
	// 		indexedHeatMap = indexHeatColors(blamedDocument);

	// 		const decorations = await getBlamedDecorations(editor?.document!);

	// 		editor?.setDecorations(decorationType, decorations);

	// 		// const decs = await getCoolDecorations(editor?.document.lineCount!);
	// 		// const ranges = decs.map(dec => dec.range);

	// 		// editor?.setDecorations(vscode.window.createTextEditorDecorationType({
	// 		// 	rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
	// 		// 	cursor: 'pointer',
	// 		// 	backgroundColor: 'red',
	// 		// 	color: 'green',
	// 		// 	overviewRulerColor: 'yellow',
	// 		// 	textDecoration: 'underline',
	// 		// 	outline: '4px groove green',
	// 		// 	border: '2px dotted green',
	// 		// 	after: {
	// 		// 		contentText: 'asdf',

	// 		// 	}
	// 		// }), ranges);


	// 		// vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
	// 		// 	console.log('event');
	// 		// });
			

	// 		vscode.workspace.onDidChangeTextDocument((event) => {

	// 			// console.log('file changed', event.document.fileName);

	// 			if (toggleBlame) {
	// 				editor?.setDecorations(decorationType, decorations);
	// 			}
	// 		});

	// 	} else {
	// 		editor?.setDecorations(decorationType, []);
	// 	}

	// });

	// vscode.window.onDidChangeActiveTextEditor((event) => {
	// 	toggleBlame = false;
	// });

	// vscode.commands.registerCommand('default:type', (args) => {
	// 	console.log('args', args);
	// });

	// vscode.workspace.on


	// vscode.commands.registerCommand('simply-blame.toggle', () => {

	// 	console.log('here');

	// 	toggleBlame = !toggleBlame;

	// });

	// context.subscriptions.push(helloWorld, simplyBlame);

}

// This method is called when your extension is deactivated
export function deactivate() {}
