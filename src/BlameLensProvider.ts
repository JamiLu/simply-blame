import { CancellationToken, CodeLens, CodeLensProvider, ProviderResult, Range, TextDocument } from "vscode";

export class BlameLensProvider implements CodeLensProvider {

	private toggleBlame: boolean;

	constructor(toggleBlame: boolean) {
		this.toggleBlame = toggleBlame;
	}

	provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
        
		const range = new Range(0, 0, 0, 0);

		const blameLens = new CodeLens(range, {
			title: "Blame This",
			command: "simply-blame.simplyBlame"
		});

		console.log('siis here');

		return [blameLens];
	}

	resolveCodeLens(codeLens: CodeLens, token: CancellationToken): ProviderResult<CodeLens> {
		return codeLens;
	}
}
