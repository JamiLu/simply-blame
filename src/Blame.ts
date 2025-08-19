/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseDate, prependZero } from './Date';
import { getFilename } from './Utils';
import Notifications from './Notifications';
import Settings from './Settings';

export interface BlamedAuthor {
    name: string;
    displayName: string;
}

export interface BlamedDate {
	dateString: string;
	date: Date;
	localDate: string;
	dateMillis: number;
	timeString: string;
}

export interface BlamedDocument {
	hash: string;
	date: BlamedDate;
	author: BlamedAuthor;
	email: string;
	codeline: string;
	linenumber: string;
	summary: string;
	filename: string;
}

export const ZERO_HASH = '0000000000000000000000000000000000000000';

const MAX_RETRY = 5;
const BUFFER = 1024;

export const promiseExec = promisify(exec);

const createAuthor = (author: string, authorStyle: 'full' | 'first' | 'last'): BlamedAuthor => {
    const blamedAuthor = { name: author, displayName: author };
    switch (authorStyle) {
        default:
        case 'full':
            return blamedAuthor;
        case 'first':
            const first = author.substring(0, author.lastIndexOf(' '));
            blamedAuthor.displayName = first || author;
            return blamedAuthor;
        case 'last':
            blamedAuthor.displayName = author.substring(author.lastIndexOf(' ') + 1);
            return blamedAuthor;
    }
};

const createDate = (seconds: number, dateFormat: string): BlamedDate => {
    const d = new Date(seconds * 1000);
    return {
        dateString:  `${d.getFullYear()}${d.getMonth()}${d.getDate()}`,
        date: d,
        localDate: parseDate(d, dateFormat),
        dateMillis: d.getTime(),
        timeString: `${prependZero(d.getHours())}:${prependZero(d.getMinutes())}`
    };
};

export const blameFile = async (file: string) => {
    const name = getFilename(file);
    const location = file.replace(name || '', '');

    let retryCount = 0;
    let shouldRetry = false;
    do {
        try {
            const bufferLength = BUFFER + retryCount * 512;
            const { stdout } = await promiseExec(`cd ${location} && git blame --porcelain ${name}`, { maxBuffer: bufferLength * bufferLength });
	
            return stdout;
        } catch (e) {
            if ((e as Error).message.match(/git\:?\s*(not found)?/)) {
                Notifications.gitNotFoundNotification();
            } else if (e instanceof RangeError) {
                if (retryCount < MAX_RETRY) {
                    retryCount++;
                    shouldRetry = true;
                } else {
                    Notifications.commonErrorNotification(e as Error, true);
                }
            } else {
                Notifications.commonErrorNotification(e as Error, true);
            }
		  }
    } while (shouldRetry);
	

    return '';
};

export const blame = async (document: vscode.TextDocument): Promise<BlamedDocument[]> => {
  	const blamed = (await blameFile(document.fileName)).split("\n");
    const authorStyle = Settings.getAuthorStyle();
    const dateFormat = Settings.getDateFormat();

    let codelineNext = false;
    const parsed: BlamedDocument[] = [];
    const authors: Record<string, BlamedDocument> = {};
	
    blamed.map((line) => {
        const [, hash,, linenumber] = line.match((/([0-9a-f]{40})\s(\d+)\s(\d+)\s?(\d*)/)) ?? [];

        if (hash && linenumber && !codelineNext) {
            parsed.push({
                hash,
                linenumber,
                author: {} as BlamedAuthor,
                email: '',
                codeline: '',
                date: {} as BlamedDate,
                summary: '',
                filename: '',
            });
        } else if (parsed.length > 0) {
            const entry = parsed.at(-1)!;

            const [,, author] = line.match(/(author\s)(.*)/) ?? [];
            const [,, email] = line.match(/(author-mail\s)<(.*)>/) ?? [];
            const [,, time] = line.match(/(author-time\s)(.*)/) ?? [];
            const [,, summary] = line.match(/(summary\s)(.*)/) ?? [];
            const [,, filename] = line.match(/(filename\s)(.*)/) ?? [];

            if (author && !codelineNext && !email && !time && !summary && !filename) {
                entry.author = createAuthor(author, authorStyle);
                authors[entry.hash] = entry;
            } else if (email && !codelineNext && !author && !time && !summary && !filename) {
                entry.email = email;
                authors[entry.hash] = entry;
            } else if (time && !codelineNext && !author && !email && !summary && !filename) {
                entry.date = createDate(Number(time), dateFormat);
                authors[entry.hash] = entry;
            } else if (summary && !codelineNext && !author && !email && !time && !filename) {
                entry.summary = summary;
                authors[entry.hash] = entry;
            } else if (filename && !codelineNext && !author && !email && !time && !summary) {
                entry.filename = filename;
                authors[entry.hash] = entry;
                codelineNext = true;
            } else if (codelineNext) {
                entry.codeline = line;
                authors[entry.hash] = entry;
                codelineNext = false;
            } else if (line.length > 0) {
                const info = authors[entry.hash];
                entry.author = info.author;
                entry.email = info.email;
                entry.date = info.date;
                entry.summary = info.summary;
                entry.filename = info.filename;
                entry.codeline = line;
            }
			
            parsed.splice(-1, 1, entry);
        }
    });

    return parsed;
};
