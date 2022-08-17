import * as vsc from "vscode";

export default function alignIndentSteps(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
	const 
		doc  = tEditor.document,
		opts = tEditor.options,
		EOL  = ["", "\n", "\r\n"][doc.eol],
		TAB  = opts.insertSpaces && typeof opts.tabSize === "number" ? 
		" ".repeat(opts.tabSize) : "\t",
		newSelections: vsc.Selection[] = [];
	
	tEditor.edit((edit) => {
		const tabSize = (typeof opts.tabSize === "number")? opts.tabSize : 1;
		for (let sel of tEditor.selections) {
			const 
				wholeStringsRange = getWholeLinesRange(doc, sel),
				newSel = new vsc.Selection(wholeStringsRange.start, wholeStringsRange.end),
				text = doc.getText(wholeStringsRange),
				lines = text.split(EOL),
				lModels = lines.map((line: string, n): ILineModel => {
					const [indent, content] = separateIndent(line);
					return {
						raw: line,
						indent,
						content,
						indentOffset: getIndentOffset(indent, opts),
						n,
					};
				}),
				stringCount = lModels.length;

			lModels.sort((a,b) => {
				const aI = a.indentOffset, bI = b.indentOffset;
				return aI < bI ? -1 : aI === bI ? 0 : 1;
			});

			for (const [k, v]of lModels.entries()) {
				const 
					[steps, shift] = getIndentSteps(v.indentOffset, opts),
					newIndent = TAB.repeat(steps);
				v.result = newIndent + v.content;
				for (let i = k + 1; i < stringCount; i++) {
					lModels[i].indentOffset += shift;
				}
			}
			lModels.sort((a,b) => {
				return a.n < b.n ? -1 : 1;
			});

			const newText = lModels.map((v) => v.result).join(EOL);

			edit.replace(wholeStringsRange, newText);
			// edit.replace(sel, doc.getText(sel).trim());
			newSelections.push(newSel);
		}
		tEditor.selections = newSelections;
	});
}

function getWholeLinesRange(doc: vsc.TextDocument, range: vsc.Range): vsc.Range {
	const 
		text = doc.getText(),
		[a, b] = rangeToOffsets(doc, range),
		aa = getLineOffsets(text, a)[0],
		bb = getLineOffsets(text, b)[1],
		newRange = offsetsToRange(doc, [aa, bb]);
	return newRange;

}

function rangeToOffsets(doc: vsc.TextDocument, range: vsc.Range): [number, number] {
	return [range.start, range.end].map(doc.offsetAt) as [number, number];
}

function offsetsToRange(doc: vsc.TextDocument, offsets: [number, number]): vsc.Range {
	const [a, b] = offsets.map(doc.positionAt);
	return new vsc.Range(a, b);
}

function getLineOffsets(text: string, offset: number, eol: string ="\n"): [number, number] {
	let i: number, nextI: number, a: number, b: number;
	a = nextI = offset;
	while (text[i = nextI--]) {
		if (text.startsWith(eol, i)) {
			a = i + eol.length;
			break;
		}
	}
	b = nextI = offset;
	while (text[i = nextI++]) {
		if (text.startsWith(eol, i)) {
			b = i;
			break;
		}
	}
	return [a, b];
}

interface ILineModel {
	raw:          string;
	result?:      string;
	indent:       string;
	content:      string;
	indentOffset: number;
	n:            number;
}

function separateIndent(line: string): [string, string] {
	const m = line.match(/^(\s*)(.*)$/);
	return m ? [m[1], m[2]] : ["", ""];
}

function getIndentOffset(indent: string, opts: vsc.TextEditorOptions): number {
	const tabSize = (typeof opts.tabSize === "number")? opts.tabSize : 1;
	return indent.replace(/\t/g, " ".repeat(tabSize)).length;
}

function getIndentSteps(offset: number, opts: vsc.TextEditorOptions): [number, number] {
	const 
		tabSize = (typeof opts.tabSize === "number")? opts.tabSize : 1,
		steps = Math.ceil(offset / tabSize),
		fixedOffset = steps * tabSize,
		shift = fixedOffset - offset;
	return [steps, shift];
}