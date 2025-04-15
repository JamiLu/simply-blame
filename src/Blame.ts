import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseDate } from './Date';
import { getFilename } from './Utils';
import Notifications from './Notifications';

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
	author: string;
	email: string;
	codeline: string;
	linenumber: string;
	summary: string;
	filename: string;
}

const MAX_RETRY = 5;
const BUFFER = 1024;

export const promiseExec = promisify(exec);

const createDate = (seconds: number): BlamedDate => {
	const d = new Date(seconds * 1000);
	return {
		dateString:  `${d.getFullYear()}${d.getMonth()}${d.getDate()}`,
		date: d,
		localDate: parseDate(d),
		dateMillis: d.getTime(),
		timeString: `${d.getHours()}:${d.getMinutes()}`
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
			const { stdout } = await promiseExec(`cd ${location} && git blame --line-porcelain ${name}`, { maxBuffer: bufferLength * bufferLength });
	
			return stdout;
		} catch (e) {
			if ((e as Error).message.includes('git: not found')) {
				Notifications.gitNotFoundNotification();
			} else if ((e as Error).message.includes('maxBuffer length exceeded')) {
				if (retryCount < MAX_RETRY) {
					retryCount++;
					shouldRetry = true;
				} else {
					Notifications.commonErrorNotification(e as Error, true);
				}
			} else {
				Notifications.commonErrorNotification(e as Error);
			}
		  }
	} while (shouldRetry);
	

  return '';
};

export const blame = async (document: vscode.TextDocument): Promise<BlamedDocument[]> => {
  	const blamed = (await blameFile(document.fileName)).split("\n");

	let codelineNext = false;
	const parsed: BlamedDocument[] = [];
	
	blamed.map((line) => {
		const [, hash,, linenumber] = line.match((/([0-9a-f]{40})\s(\d+)\s(\d+)\s?(\d*)/)) ?? [];

		if (hash && linenumber) {
			parsed.push({
				hash,
				linenumber,
				author: '',
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

			if (author) {
				entry.author = author;
			} else if (email) {
				entry.email = email;
			} else if (time) {
				entry.date = createDate(Number(time));
			} else if (summary) {
				entry.summary = summary;
			} else if (filename) {
				entry.filename = filename;
				codelineNext = true;
			} else if (codelineNext) {
				entry.codeline = line;
				codelineNext = false;
			}
			
			parsed.splice(-1, 1, entry);
		}
	});

	return parsed;
};
