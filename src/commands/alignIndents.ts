import * as vsc from "vscode";

export default function alignIndents(tEditor: vsc.TextEditor, edit: vsc.TextEditorEdit, ...args: any[]) {
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
				lines = text.split(EOL);
			const 
				stack: ILevelModel [] = [],
				last = () => stack[stack.length - 1];

			for (const [k, line] of lines.entries()) {
				const 
					[indent, payload] = separateIndent(line),
					offset = getIndentOffset(indent, opts),
					lModel: ILineModel = {
						type: "ILineModel",
						raw: line,
						indent,
						payload,
						offset,
					};
				if (!k) {
					stack.push({
						type: "ILevelModel",
						indent,
						offset, 
						ch: []
					});
				} else {}

				if (offset === last().offset) {
					last().ch.push(lModel);
				} else if (last().offset < offset) {
					const level: ILevelModel = {
						type: "ILevelModel",
						offset,
						indent,
						ch: [
							lModel
						]
					};
					// level.ch.push(lModel);
					last().ch.push(level);
					stack.push(level);
				} else if (offset < last().offset) {
					while (stack.length) {
						if (1 < stack.length) {
							stack.pop();
							if (offset === last().offset) {
								last().ch.push(lModel);
								break;
							} else if (last().offset < offset) {
								last().ch.push(lModel);
								break;
							} else if (offset < last().offset) {
								continue;
							}
						} else {
							const level: ILevelModel = {
								type: "ILevelModel",
								offset, 
								indent,
								ch: [
									last(),
									lModel
								]
							};
							stack.unshift(level);
							break;
						}
					}
				} else {}
			}
			const 
				model = stack[0],
				baseIndent = model.indent,
				newLines: string [] = [];
			recur(model);
			let newText = newLines.join(EOL);


			edit.replace(wholeStringsRange, newText);
			// edit.replace(sel, doc.getText(sel).trim());
			newSelections.push(newSel);

			function recur(node: (ILevelModel|ILineModel), level: number =-1) {
				if (node.type === "ILevelModel") {
					for (const ch of node.ch) {
						recur(ch, level + 1);
					}
				} else if (node.type === "ILineModel") {
					const 
						pl = node.payload,
						line = pl ? baseIndent + TAB.repeat(level)+pl : "";
					newLines.push(line);
				} else {}
			}
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

interface ILevelModel {
	type:   "ILevelModel";
	offset: number;
	indent: string;
	ch:     (ILineModel|ILevelModel) [];
}

interface ILineModel {
	type:    "ILineModel";
	raw:     string;
	indent:  string;
	payload: string;
	offset:  number;
}
