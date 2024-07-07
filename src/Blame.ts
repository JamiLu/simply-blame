import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import Notifications from "./Notifications";
import Settings from "./Settings";

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

const BLAME_PATTERN =
  /(^\^?\w{0,}).*\((.+)\s+(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \+\d{4}).* (\d+)\) (.*$)/;

const locale = Settings.getDateLocale();

export const promiseExec = promisify(exec);

const createDate = (str: string): BlamedDate => {
	const d = new Date(str);
	return {
		dateString: str.match(/\d{4}-\d{2}-\d{2}/)?.join() || "",
		dateTimeString:
		str.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)?.join() || "",
		dateTimeZoneString: str,
		date: d,
		localDate: d.toLocaleDateString(locale),
		dateMillis: Date.parse(str)
	};
};

export const blameFile = async (file: String) => {
  const loc = (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.path) || "/";

	try {
		const { stdout, stderr } = await promiseExec(`cd ${loc} && git blame ${file}`);

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
		Notifications.parsingBlameFailed();
	}

	return parsed;
};
