import type { MailBlock } from "../mailBlock.type.ts";
import { meterPercent } from "../meterPercent.ts";
import { describeHref } from "./describeHref.ts";

// La même brique que le HTML, pour les clients mail qui refusent le HTML
export function renderBlockText(block: MailBlock): string {
	switch (block.kind) {
		case "paragraph":
			return block.text;
		case "quote":
			return `${block.label} :\n${block.text}`;
		case "fields":
			return block.fields
				.map(({ label, value }) => `${label} : ${value}`)
				.join("\n");
		case "callout":
			return `${block.title}\n${block.text}`;
		case "button":
			return `${block.label} : ${describeHref(block.href)}`;
		case "code":
			return `${block.label} : ${block.code}`;
		case "meter":
			return `${block.value} / ${block.max} ${block.caption} (${meterPercent(block.value, block.max)} %)`;
		case "statuses":
			return block.statuses
				.map(({ label, detail, state }) => `- ${label} (${detail}) : ${state}`)
				.join("\n");
		default:
			return `${block.name}\n${block.href}`;
	}
}
