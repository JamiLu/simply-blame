/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as blameMock from '../../Blame';
import * as sinon from 'sinon';
import { TextEncoder } from 'util';

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

export const createMockBlame = (i: number, d: Date): blameMock.BlamedDocument => {
    return {
        author: { name: 'test', displayName: 'test' },
        codeline: '1',
        date: {
            date: d,
            dateMillis: d.getTime(),
            dateString: `${d.getTime() / 1000}`,
            localDate: `${d.getFullYear()} ${d.getMonth()} ${d.getDate()}`,
            timeString: `${d.getHours()}:${d.getMinutes()}`,
        },
        email: 'test@test',
        filename: 'test.ts',
        hash: i.toString(16),
        linenumber: 'f',
        summary: 'generated'
    };
};

export const createMockBlamedDocument = () => {
    const date = new Date(2024, 0, 30); // Jan 30 2024
    const blamed: blameMock.BlamedDocument[] = [];
    for (let i = 25; i > 10; i--) {
        date.setDate(i);
        blamed.push(createMockBlame(i, date));
    }
    return blamed;
};

export const createMockGitConfig = (): { create: () => Promise<void>, purge: () => Promise<void> }  => {
    console.log('ff', path.resolve(__dirname, '../fixtures'));
    let wfMock = sinon.stub(vscode.workspace, 'workspaceFolders').returns([path.resolve(__dirname, '../fixtures')]);
    const wsRoot = vscode.workspace.workspaceFolders?.at(0)?.uri.fsPath;
    const config = vscode.Uri.file(`${wsRoot}/.git/config`);
    console.log('con', config);
    return {
        create: async () => await vscode.workspace.fs.writeFile(config, new TextEncoder().encode(`url = git@github.com:test/test-repo.git\n`)),
        purge: async () => {
            wfMock.restore();
            await vscode.workspace.fs.delete(config);
        }
    };
};
