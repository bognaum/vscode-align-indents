import * as vsc from "vscode";

export {
	searchInIndents,
	getWholeLinesRange,
	rangeToOffsets,
	offsetsToRange,
	offsetsToSelection,
	getLineOffsets,
	separateIndent,
	getIndentOffset,
};

function searchInIndents(text: string, eol: string, re: RegExp, shift: number =0): 
[number, number][] {
	const 
		results: [number, number][] = [],
		indents: [number, number][] = [],
		tLen = text.length;
	let indentStart = 0;
	for (let i = 0, isIndent = true; i < tLen; i++) {
		if (isIndent) {
			if (text[i] !== " " && text[i] !== "\t") {
				isIndent = false;
				indents.push([indentStart, i]);
			}
		} else {}
		if (text.startsWith(eol, i)) {
			i += eol.length - 1;
			isIndent = true;
			indentStart = i + 1;
		}
	}
	for (const [a, b] of indents) {
		const 
			indentText = text.slice(a, b),
			matches = [...indentText.matchAll(re)],
			regions = matches.map((m) => {
				const 
					i0: number = m.index as number,
					i1: number = i0 + m[0].length;
				return [a + i0, a + i1] as [number, number];
			});
		results.push(...regions);
	}
	results.forEach((v) => {
		v.forEach((v,i,a) => a[i] = shift + v);
	});
	return results;
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

function offsetsToSelection(doc: vsc.TextDocument, offsets: [number, number]): vsc.Selection {
	const [a, b] = offsets.map(doc.positionAt);
	return new vsc.Selection(a, b);
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