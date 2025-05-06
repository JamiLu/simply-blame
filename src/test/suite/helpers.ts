import * as vscode from 'vscode';
import * as path from 'path';

export let document: vscode.TextDocument;

const getTestFile = () => {
	return vscode.Uri.file(path.resolve(__dirname, '../fixtures/test.txt'));
};

export const activateExtension = async () => {
	const ext = vscode.extensions.getExtension('jami-lu.simply-blame');
	await ext?.activate();
	try {
		document = await vscode.workspace.openTextDocument(getTestFile());
	} catch (e) {
		console.error(e);
	}
	return ext;
};
