# Markdown Guide
Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2020.

## About Markdown

*Markdown* is a plain text format for writing structured documents, based on conventions for indicating formatting in email and usenet posts. It was developed by *John Gruber* (with help from *Aaron Swartz*) and released in 2004 in the form of a syntax description and a Perl script (Markdown.pl) for converting Markdown to HTML. In the next decade, dozens of implementations were developed in many languages. Some extended the original Markdown syntax with conventions for footnotes, tables, and other document elements. Some allowed Markdown documents to be rendered in formats other than HTML. Websites like Reddit, StackOverflow, and GitHub had millions of people using Markdown. And Markdown started to be used beyond the web, to author books, articles, slide shows, letters, and lecture notes.

## Reference

### Standards

- [Markdown v1.0.1](https://daringfireball.net/projects/markdown/) is the original [syntax specification](https://daringfireball.net/projects/markdown/syntax) and at the same time [the tool written in Perl](https://daringfireball.net/projects/downloads/Markdown_1.0.1.zip) by *John Gruber* in 2004.
- [Pandoc’s Markdown](https://pandoc.org/MANUAL.html#pandocs-markdown) is an extended and slightly revised version of *John Gruber’s* Markdown syntax.
- [CommonMark](https://commonmark.org/) is a standard, unambiguous syntax specification for Markdown, along with a suite of comprehensive tests to validate Markdown implementations against this specification.
- [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/) is the dialect of Markdown that is currently supported for user content on GitHub.com and GitHub Enterprise. GFM is a strict superset of CommonMark. All the features which are supported in GitHub user content and that are not specified on the original CommonMark Spec are hence known as extensions, and highlighted as such.

### Guides

- [markdownguide.org](https://www.markdownguide.org/)
- [docs.github.com](https://docs.github.com/en/github/writing-on-github)
- *Bold or italic?* on [practicaltypography.com](https://practicaltypography.com/bold-or-italic.html)

### Tools

- [Pandoc](https://pandoc.org/) a universal document converter.
- [Markdown Here](https://markdown-here.com/) is an extension for popular browsers which allows you to easily prepare good-looking e-mails using Markdown syntax.
- [tablesgenerator.com](https://www.tablesgenerator.com/markdown_tables#)

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
- [Extras](#extras)
    - [Keyboard](#keyboard)

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

To break line using Markdown, you end a line with two or more spaces and <kbd>Return</kbd>.

A line broken with 2 spaces  
and return.
```markdown
A line broken with 2 spaces  
and return.
```

Avoid using backslash `\` or `<br />` since it hampers raw text readability.

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

> Blockquote with **Markdown** inside.
```markdown
> Blockquote with **Markdown** inside.
```

> Multi line
> does not work
> until you type **2 spaces**  
> and **return**.
```markdown
> Multi line
> does not work
> until you type **2 spaces**  
> and **return**.
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

4 spaces make nested item.

- First item
- Second item
    - Second nested item
    - Second next nested item
        - Further nesting...
- Third item
```markdown
- First item
- Second item
    - Second nested item
    - Second next nested item
        - Further nesting...
- Third item
```

#### Available characters
```
-   minus sign (hyphen)
*   asterisk
+   plus sign
```

### Code

Inline `code` write in backticks.
```markdown
Inline `code` write in backticks.
```

### Link

#### Inline style

[Link text](https://www.example.com "With title")
```markdown
[Link text](https://www.example.com)
[Link text](https://www.example.com "With title")
```

#### Reference style

[Link text][Reference]

[Reference]: https://www.example.com "With title"
```markdown
[Link text][Reference]

[Reference]: https://www.example.com
[Reference]: https://www.example.com "With title"
```

#### Automated link

https://www.example.com
```markdown
https://www.example.com
```

Escape from automated link needs some workaround like:
- backticks `https://www.example.com`,
- [zero-width space](https://en.wikipedia.org/wiki/Zero-width_space) character (Unicode character `U+200B`, HTML `&#8203;`) but it's hard to [type](http://www.somebits.com/weblog/tech/zero-width-space.html).

Here's an example with a *zero-width space* inserted between `https` and `:`

https​://example.com

### Image

#### Inline style

![Image alt text](image.jpg "With title")
```markdown
![Image alt text](image.jpg)
![Image alt text](image.jpg "With title")
```

#### Reference style

![Image alt text][Reference]

[Reference]: image.jpg "With title"
```markdown
![Image alt text][Reference]

[Reference]: image.jpg
[Reference]: image.jpg "With title"
```

#### Image link to YouTube

[![Image alt text](http://img.youtube.com/vi/<video_id>/0.jpg)](http://www.youtube.com/watch?v=<video_id>)
```markdown
[![Image alt text](http://img.youtube.com/vi/<video_id>/0.jpg)](http://www.youtube.com/watch?v=<video_id>)
```

### Escapes

Text with escaping special \`characters\`.
```markdown
Text with escaping special \`characters\`.
```
Markdown provides backslash escapes for the following characters (`\char` ):
```
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

| Column 1 | Column 2 (aligned left) | Column 3 (centered) | Column 4 (aligned right) |
| --- | :-- | :-: | --: |
| Cell 11 | Cell 12 | Cell 13 | Cell 14 |
| Cell 21 | Cell 22 | Cell 23 | Cell 24 |
| Cell 31 | Cell 32 text with line<br />break. | Cell 33 | Cell 34 |
```markdown
| Column 1 | Column 2 (aligned left) | Column 3 (centered) | Column 4 (aligned right) |
| --- | :-- | :-: | --: |
| Cell 11 | Cell 12 | Cell 13 | Cell 14 |
| Cell 21 | Cell 22 | Cell 23 | Cell 24 |
| Cell 31 | Cell 32 text with line<br />break. | Cell 33 | Cell 34 |
```
> Table may support very few nested markdowns. For example does not support `# Heading` nor list inside a table. You may use HTML then, as shown above with `<br />` tag.

### Code Block

```
fenced
code
block
```
```markdown
    ```
    fenced
    code
    block
    ```
```

Some interpreters support syntax definition and highlighting:

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
```

```
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

## Extras
Auxiliary section that is outside of the Markdown scope.

### Keyboard

#### General Keyboard

<kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>Del</kbd>
```markdown
<kbd>Control</kbd>+<kbd>Shift</kbd>+<kbd>Del</kbd>
```

#### macOS Keyboard

##### Glyphs

In any app context:
- press <kbd>⌃⌘Space</kbd> (<kbd>⌃ Control</kbd>+<kbd>⌘ Command</kbd>+<kbd>Space</kbd>) or
- choose `Menu > Edit > Emoji & Symbols`

and click ⌘ icon to access **Technical Characters**. Click on chosen glyph to paste it at the coursor position.

More info on Apple support article [Use emoji and symbols on Mac](https://support.apple.com/guide/mac-help/use-emoji-and-symbols-on-mac-mchlp1560/mac).

##### Most popular

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
