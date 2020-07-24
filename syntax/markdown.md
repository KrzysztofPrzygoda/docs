# Markdown Guide

**Markdown** is a text-to-HTML conversion tool for web writers. Markdown allows you to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML (or HTML).

Thus, **Markdown** is two things: (1) a plain text formatting syntax; and (2) a software tool, that converts the plain text formatting to HTML.

## Reference

### Versions
- [Markdown v1.0.1](https://daringfireball.net/projects/markdown/) is the original [syntax specification](https://daringfireball.net/projects/markdown/syntax) and at the same time [the tool written in Perl](https://daringfireball.net/projects/downloads/Markdown_1.0.1.zip) by *John Gruber* in 2004.

### Guides
- [markdownguide.org](https://www.markdownguide.org/)
- [docs.github.com](https://docs.github.com/en/github/writing-on-github)
 

## Table of Contents

- [Basic Syntax](#basic-syntax)
    - [Heading](#heading)
    - [Paragraph](#paragraph)
    - [Line Break](#line-break)
    - [Bold](#bold)
    - [Italic](#italic)
    - [Blockquote](#blockquote)
    - [Ordered List](#ordered-list)
    - [Unordered List](#unordered-list)
    - [Code](#code)
    - [Link](#link)
    - [Image](#image)
    - [Escapes](#escapes)
    - [Horizontal Rule](#horizontal-rule)
- [Extended Syntax](#extended-syntax)
    - [Table](#table)
    - [Code Block](#code-block)
    - [Footnote](#footnote)
    - [Heading ID](#heading-id-custom-id)
    - [Definition List](#definition-list)
    - [Strikethrough](#strikethrough)
    - [Task List](#task-list)
- [Keyboard Glyphs](#keyboard-glyphs)
    - [General Keyboard](#general-keyboard)
    - [macOS Keyboard](#macos-keyboard)

## Basic Syntax

These are the elements outlined in *John Gruber’s* original design document of [Markdown v1.0.1](https://daringfireball.net/projects/markdown/syntax#em).
> **All Markdown applications should support these elements.**

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

A paragraph is simply one or more consecutive lines of text, separated by one or more blank lines (a line containing nothing but spaces or tabs is considered blank).

First paragraph.

Second paragraph.


Third paragraph.
```markdown
First paragraph.

Second paragraph.


Third paragraph.
```

### Line Break

To break line using Markdown, you end a line with two or more <kbd>spaces</kbd> and <kbd>return</kbd>.

A line broken with 2 spaces  
and return.
```markdown
A line broken with 2 spaces  
and return.
```

Some interpreters accepts a backslash\
and return.
```markdown
Some interpreters accepts a backslash\
and return.
```

A line with HTML break<br />can produce double new line on some interpreters.
```markdown
A line with HTML break<br />can produce double new line on some interpreters.
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

### Escapes

Text with escaping special \`characters\`.
```markdown
Text with escaping special \`characters\`.
```
Markdown provides backslash escapes for the following characters (`\char` ):
```markdown
\   backslash
`   backtick
*   asterisk
_   underscore
{}  curly braces
[]  square brackets
()  parentheses
#   hash mark
+   plus sign
-   minus sign (hyphen)
.   dot
!   exclamation mark
```

### Horizontal Rule

---
```markdown
---
```

## Extended Syntax

These elements extend the basic syntax by adding additional features.
> **Not all Markdown applications support these elements.**

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
> Usually table supports very few nested markdowns. For example does not support `# Heading` or list inside table. Then you can use HTML.

### Code Block

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
