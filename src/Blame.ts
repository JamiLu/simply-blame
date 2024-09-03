import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import { parseDate } from "./Date";
import { getFilename } from "./Utils";
import Notifications from "./Notifications";

export interface BlamedDate {
	dateString: string;
	dateTimeString: string;
	dateTimeZoneString: string;
	date: Date;
	localDate: string;
	dateMillis: number;
}

export interface BlamedDocument {
	hash: string;
	date: BlamedDate;
	author: string;
	codeline: string;
	linenumber: string;
}

const BLAME_PATTERN = /(^\^?[0-9a-f]+).*\(([^/&%¤#"!?=(){}\\\[\]]+)\s+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [\+-]\d{4}).* (\d+)\) (.*$)/;

export const promiseExec = promisify(exec);

const createDate = (str: string): BlamedDate => {
	const d = new Date(str);
	return {
		dateString: str.match(/\d{4}-\d{2}-\d{2}/)?.join() || "",
		dateTimeString:
		str.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.join() || "",
		dateTimeZoneString: str,
		date: d,
		localDate: parseDate(d),
		dateMillis: Date.parse(str)
	};
};

export const blameFile = async (file: string) => {
	const name = getFilename(file);
	const location = file.replace(name || '', '');

	try {
		const { stdout, stderr } = await promiseExec(`cd ${location} && git blame ${name}`, { maxBuffer: 2056 * 2056 });

		return stdout;
	} catch (e) {
		if ((e as Error).message.includes('git: not found')) {
			Notifications.gitNotFoundNotification();
		} else {
			Notifications.commonErrorNotification((e as Error).message);
		}
		// maybe log the error
  }

  return '';
};

const cleanFailedToParse = (line: string) => {
	return line.substring(0, line.indexOf(')') + 1);
};

export const blame = async (document: vscode.TextDocument): Promise<BlamedDocument[]> => {
  	const blamed = (await blameFile(document.fileName)).split("\n");

	const failedToParse: string[] = [];

	const parsed = blamed.map((line) => {
		const match = line.match(BLAME_PATTERN);

      	if (match?.[1]) {
			return ({
				hash: match[1],
				author: match[2]?.trim(),
				date: createDate(match[3]),
				linenumber: match[4],
				codeline: match[5],
			} as BlamedDocument);
		} else if (line.length > 0) {
			failedToParse.push(line);
			return undefined;
		}
	  	
    }) as BlamedDocument[];

	if (failedToParse.length > 0) {
		Notifications.parsingBlameFailed(failedToParse.map(cleanFailedToParse));
	}

	return parsed;
};
