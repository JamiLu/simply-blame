/**
 * License GPL-2.0
 */
import * as vscode from 'vscode';
import { parseDate, prependZero } from './Date';
import Settings from './Settings';
import { blameFile } from './Git';
import { log } from './Logger';

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

export const blame = async (document: vscode.TextDocument): Promise<BlamedDocument[]> => {
  	const blamed = (await blameFile(document.fileName)).split("\n");
    log.trace('Got blamed file');
    const authorStyle = Settings.getAuthorStyle();
    const dateFormat = Settings.getDateFormat();

    let lastLine = 'codeline';
    const parsed: BlamedDocument[] = [];
    const authors: Record<string, BlamedDocument> = {};
	
    blamed.forEach((line) => {
        const [, hash,, linenumber] = line.match((/^([0-9a-f]{40})\s(\d+)\s(\d+)\s?(\d*)$/)) ?? [];
        if (hash && linenumber && lastLine === 'codeline') {
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
        } 
        else if (parsed.length > 0) {
            const entry = parsed.at(-1)!;

            const [,, author] = line.match(/(author\s)(.*)/) ?? [];
            const [,, email] = line.match(/(author-mail\s)<(.*)>/) ?? [];
            const [,, time] = line.match(/(author-time\s)(.*)/) ?? [];
            const [,, summary] = line.match(/(summary\s)(.*)/) ?? [];
            const [,, filename] = line.match(/(filename\s)(.*)/) ?? [];

            if (author && !email && !time && !summary && !filename && !authors[entry.hash]) {
                entry.author = createAuthor(author, authorStyle);
                authors[entry.hash] = entry;
                lastLine = 'author';
            } else if (email && !author && !time && !summary && !filename && lastLine === 'author') {
                entry.email = email;
                authors[entry.hash] = entry;
                lastLine = 'email';
            } else if (time && !author && !email && !summary && !filename && lastLine === 'email') {
                entry.date = createDate(Number(time), dateFormat);
                authors[entry.hash] = entry;
                lastLine = 'date';
            } else if (summary && !author && !email && !time && !filename && lastLine === 'date') {
                entry.summary = summary;
                authors[entry.hash] = entry;
                lastLine = 'summary';
            } else if (filename && !author && !email && !time && !summary && lastLine === 'summary') {
                entry.filename = filename;
                authors[entry.hash] = entry;
                lastLine = 'filename';
            } else if (line.length > 0 && authors[entry.hash]) {
                const info = authors[entry.hash];
                entry.author = info.author;
                entry.email = info.email;
                entry.date = info.date;
                entry.summary = info.summary;
                entry.filename = info.filename;
                entry.codeline = line;
                lastLine = 'codeline';
            }
            
            parsed.splice(-1, 1, entry);
        }
    });

    log.trace('Parsed lines', parsed.length);

    return parsed;
};
