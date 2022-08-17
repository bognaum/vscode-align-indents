import * as vsc from "vscode";
import {
	getWholeLinesRange,
	rangeToOffsets,
	offsetsToRange,
	getLineOffsets,
	separateIndent,
	getIndentOffset,
} from "../functions";

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
					const [indent, payload] = separateIndent(line);
					return {
						raw: line,
						indent,
						payload,
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
				v.result = newIndent + v.payload;
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

function getIndentSteps(offset: number, opts: vsc.TextEditorOptions): [number, number] {
	const 
		tabSize = (typeof opts.tabSize === "number")? opts.tabSize : 1,
		steps = Math.ceil(offset / tabSize),
		fixedOffset = steps * tabSize,
		shift = fixedOffset - offset;
	return [steps, shift];
}

interface ILineModel {
	raw:          string;
	result?:      string;
	indent:       string;
	payload:      string;
	indentOffset: number;
	n:            number;
}