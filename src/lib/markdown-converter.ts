export function markdownToFormattedText(markdown: string): string {
  let text = markdown;

  text = text.replace(/^### (.*?)$/gm, "\n$1\n" + "─".repeat(40) + "\n");
  text = text.replace(/^## (.*?)$/gm, "\n$1\n" + "═".repeat(40) + "\n");
  text = text.replace(/^# (.*?)$/gm, "\n$1\n" + "█".repeat(40) + "\n");

  text = text.replace(/\*\*\*(.*?)\*\*\*/g, "$1");
  text = text.replace(/__(.*?)__/g, "$1");

  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");

  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/_(.*?)_/g, "$1");

  text = text.replace(/~~(.*?)~~/g, "$1");

  text = text.replace(/`([^`]+)`/g, "「$1」");

  text = text.replace(/```(?:\w+)?\n([\s\S]*?)```/g, "\n┌─ Code Block:\n$1\n└─\n");

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "[Image: $1]");

  text = text.replace(/^> (.*?)$/gm, "┃ $1");

  text = text.replace(/^\s*[-*+] (.*?)$/gm, "  • $1");

  text = text.replace(/^\s*\d+\. (.*?)$/gm, "  $1");

  text = text.replace(/- \[x\] (.*?)$/gm, "  ✓ $1");
  text = text.replace(/- \[ \] (.*?)$/gm, "  ○ $1");

  text = text.replace(/^(-{3}|_{3}|\*{3})$/gm, "─".repeat(40));

  text = text.replace(/^::: note\n([\s\S]*?)\n:::$/gm, "\n📝 Note:\n$1\n");
  text = text.replace(/^::: warning\n([\s\S]*?)\n:::$/gm, "\n⚠️  Warning:\n$1\n");
  text = text.replace(/^::: tip\n([\s\S]*?)\n:::$/gm, "\n💡 Tip:\n$1\n");
  text = text.replace(/^::: danger\n([\s\S]*?)\n:::$/gm, "\n⛔ Danger:\n$1\n");

  text = text.replace(/\n\n\n+/g, "\n\n");

  text = text.trim();

  return text;
}

export function markdownToPlainText(markdown: string): string {
  let text = markdown;

  text = text.replace(/^#+\s+/gm, "");

  text = text.replace(/\*\*\*(.*?)\*\*\*/g, "$1");
  text = text.replace(/__(.*?)__/g, "$1");
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/_(.*?)_/g, "$1");
  text = text.replace(/~~(.*?)~~/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");

  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  text = text.replace(/^>\s*/gm, "");

  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");
  text = text.replace(/^\s*-\s*\[.\]\s+/gm, "");

  text = text.replace(/```(?:\w+)?\n?([\s\S]*?)\n?```/g, "$1");

  text = text.replace(/^(-{3}|_{3}|\*{3})$/gm, "");

  text = text.replace(/^:::\s*\w+\n([\s\S]*?)\n:::$/gm, "$1");

  text = text.replace(/\n\n\n+/g, "\n\n");
  text = text.trim();

  return text;
}

export interface FormattedContentBlock {
  type: "heading" | "paragraph" | "list-item" | "code" | "quote" | "divider";
  level?: 1 | 2 | 3 | 4;
  content: string;
  children?: FormattedContentBlock[];
}

export function markdownToStructuredContent(markdown: string): FormattedContentBlock[] {
  const blocks: FormattedContentBlock[] = [];
  const lines = markdown.split("\n");
  let currentList: FormattedContentBlock[] = [];
  let listLevel = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentList.length > 0) {
        blocks.push({
          type: "list-item",
          content: "",
          children: currentList,
        });
        currentList = [];
        listLevel = 0;
      }
      continue;
    }

    const headingMatch = trimmed.match(/^(#+)\s+(.*)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: Math.min(headingMatch[1].length, 4) as 1 | 2 | 3 | 4,
        content: cleanFormatting(headingMatch[2]),
      });
      continue;
    }

    if (/^(-{3}|_{3}|\*{3})$/.test(trimmed)) {
      blocks.push({ type: "divider", content: "" });
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines = [trimmed.replace(/^```\w*\n?/, "")];
      let idx = lines.indexOf(trimmed) + 1;
      while (idx < lines.length && !lines[idx].trim().startsWith("```")) {
        codeLines.push(lines[idx]);
        idx++;
      }
      blocks.push({
        type: "code",
        content: codeLines.join("\n").replace(/```$/, "").trim(),
      });
      continue;
    }

    if (trimmed.startsWith(">")) {
      blocks.push({
        type: "quote",
        content: cleanFormatting(trimmed.replace(/^>\s*/, "")),
      });
      continue;
    }

    const listMatch = trimmed.match(/^(\s*)[-*+]\s+(.*)$/);
    if (listMatch) {
      currentList.push({
        type: "list-item",
        content: cleanFormatting(listMatch[2]),
      });
      continue;
    }

    blocks.push({
      type: "paragraph",
      content: cleanFormatting(trimmed),
    });
  }

  if (currentList.length > 0) {
    blocks.push({
      type: "list-item",
      content: "",
      children: currentList,
    });
  }

  return blocks;
}

function cleanFormatting(text: string): string {
  let clean = text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");

  return clean.trim();
}
