# Markdown Guide

## Reference
- **[Markdown Guide](https://www.markdownguide.org/)** ([Cheet Sheet](https://www.markdownguide.org/cheat-sheet/), [Basic Syntax](https://www.markdownguide.org/basic-syntax/), [Extended Syntax](https://www.markdownguide.org/extended-syntax/), [Tools](https://www.markdownguide.org/tools/))
- **[GitHub Guide](https://docs.github.com/en/github/writing-on-github)**

## Basic Syntax

These are the elements outlined in John Gruber’s original design document. All Markdown applications support these elements.

### Heading
# H1
`# H1`
## H2
`## H2`
### H3
`### H3`

### Bold

**bold text**\
`**bold text**`

### Italic

*italicized text*\
`*italicized text*`

### Blockquote

> blockquote

`> blockquote`

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

`code`\
\`code\`

### Horizontal Rule

---
`---`

### Link

[Link title](https://www.example.com)\
`[Link title](https://www.example.com)`

### Image

![Image alt text](image.jpg)\
`![Image alt text](image.jpg)`

## Extended Syntax

These elements extend the basic syntax by adding additional features. Not all Markdown applications support these elements.

### Table

| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |

```markdown
| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |
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
`### Heading ID {#custom-id}`

### Definition List

term
: definition

```markdown
term
: definition
```

### Strikethrough

~~The world is flat.~~\
`~~The world is flat.~~`

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

<kbd>control shift del</kbd>\
`<kbd>control shift del</kbd>`

<kbd>control</kbd>+<kbd>shift</kbd>+<kbd>del</kbd>\
`<kbd>control</kbd>+<kbd>shift</kbd>+<kbd>del</kbd>`

### macOS
In any app context press <kbd>⌃ Control</kbd>+<kbd>⌘ Command</kbd>+<kbd>Space</kbd> or choose `Menu > Edit > Emoji & Symbols` and click ⌘ icon to access Technical Characters. More info on Apple support article [Use emoji and symbols on Mac](https://support.apple.com/guide/mac-help/use-emoji-and-symbols-on-mac-mchlp1560/mac).

Most popular are:

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
