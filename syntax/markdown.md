# Markdown Guide

## Reference

- **[Markdown Guide](https://www.markdownguide.org/)** ([Cheet Sheet](https://www.markdownguide.org/cheat-sheet/), [Basic Syntax](https://www.markdownguide.org/basic-syntax/), [Extended Syntax](https://www.markdownguide.org/extended-syntax/), [Tools](https://www.markdownguide.org/tools/))
- **[GitHub Guide](https://docs.github.com/en/github/writing-on-github)**

## Table of Contents

- [Basic Syntax](#basic-syntax)
- [Extended Syntax](#extended-syntax)
- [Keyboard Glyphs](#keyboard-glyphs)

## Basic Syntax

These are the elements outlined in John Gruber’s original design document.
> **All Markdown applications support these elements.**

### Heading

# H1
```markdown
# H1
```

## H2
```markdown
## H2
```

### H3
```markdown
### H3
```

### Paragraph

First paragraph.

Second paragraph.

```markdown
First paragraph.

Second paragraph.
```

### Bold

**bold text**
```markdown
**bold text**
```

### Italic

*italicized text*
```markdown
*italicized text*
```

### Blockquote

> blockquote
```markdown
> blockquote
```

### Ordered List

1. First item
2. Second item
3. Third item

```markdown
1. First item
2. Second item
3. Third item
```

### Unordered List

- First item
- Second item
- Third item

```markdown
- First item
- Second item
- Third item
```

### Code

`code`
```markdown
`code`
```

### Link

[Link title](https://www.example.com)
```markdown
[Link title](https://www.example.com)
```

### Image

![Image alt text](image.jpg)
```markdown
![Image alt text](image.jpg)
```

### Horizontal Rule

---
```markdown
---
```

## Extended Syntax

These elements extend the basic syntax by adding additional features.
> **Not all Markdown applications support these elements.**

### Escaping Characters

Text with escaping special \`character\`.

```markdown
Text with escaping special \`character\`.
```

### Line Break

A line with\
simple break.

```markdown
A line with\
simple break.
```

A new line with<br />HTML break.
```markdown
A new line with<br />HTML break.
```

### Table

| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |
| Line break | Text with line<br />break |

```markdown
| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |
| Line break | Text with line<br />break |
```

### Fenced Code Block

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
```

```markdown
    ```json
    {
        "firstName": "John",
        "lastName": "Smith",
        "age": 25
    }
    ```
```

### Footnote

Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.

```markdown
Here's a sentence with a footnote. [^1]

[^1]: This is the footnote.
```

### Heading ID {#custom-id}
```markdown
### Heading ID {#custom-id}
```

### Definition List

term
: definition

```markdown
term
: definition
```

### Strikethrough

~~The world is flat.~~

```markdown
~~The world is flat.~~
```

### Task List

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

```markdown
- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media
```

## Keyboard Glyphs

### General Keyboard

<kbd>control shift del</kbd>

```markdown
<kbd>control shift del</kbd>
```

<kbd>control</kbd>+<kbd>shift</kbd>+<kbd>del</kbd>

```markdown
<kbd>control</kbd>+<kbd>shift</kbd>+<kbd>del</kbd>
```

### macOS Keyboard

### Icons

In any app context:
- press <kbd>⌃⌘Space</kbd> (<kbd>⌃ Control</kbd>+<kbd>⌘ Command</kbd>+<kbd>Space</kbd>) or
- choose `Menu > Edit > Emoji & Symbols`

and click ⌘ icon to access **Technical Characters**. Click on chosen icon to paste it at the coursor position.

More info on Apple support article [Use emoji and symbols on Mac](https://support.apple.com/guide/mac-help/use-emoji-and-symbols-on-mac-mchlp1560/mac).

### Most popular

| Syntax | Output |
| --- | --- |
| `<kbd>⌥ Option</kbd>` or `<kbd>⌥</kbd>` | <kbd>⌥ Option</kbd> or <kbd>⌥</kbd> |
| `<kbd>⌃ Control</kbd>` or `<kbd>⌃</kbd>` | <kbd>⌃ Control</kbd> or <kbd>⌃</kbd> |
| `<kbd>⇧ Shift</kbd>` or `<kbd>⇧</kbd>` | <kbd>⇧ Shift</kbd> or <kbd>⇧</kbd> |
| `<kbd>⌘ Command</kbd>` or `<kbd>⌘</kbd>` | <kbd>⌘ Command</kbd> or <kbd>⌘</kbd> |
| `<kbd>⎋ Escape</kbd>` or `<kbd>⎋</kbd>` | <kbd>⎋ Escape</kbd> or <kbd>⎋</kbd> |
| `<kbd>⇪ Caps lock</kbd>` or `<kbd>⇪</kbd>` | <kbd>⇪ Caps lock</kbd> or <kbd>⇪</kbd> |
| `<kbd>⇥ Tab</kbd>` or `<kbd>⇥</kbd>` | <kbd>⇥ Tab</kbd> or <kbd>⇥</kbd> |
| `<kbd>⌫ Delete</kbd>` or `<kbd>⌫</kbd>` | <kbd>⌫ Delete</kbd> or <kbd>⌫</kbd> |
| `<kbd>⏏︎ Eject</kbd>` or `<kbd>⏏︎</kbd>` | <kbd>⏏︎ Eject</kbd> or <kbd>⏏︎</kbd> |
