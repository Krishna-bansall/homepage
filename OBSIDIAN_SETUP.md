# Obsidian → Hugo Setup Guide

Your Hugo site now supports Obsidian-style wikilinks! Here's how to use it.

## Quick Start

### 1. Create Content in Obsidian

Create a new note with this template (adjust `type:` for different sections):

```markdown
---
title: 'My Note Title'
date: 2026-01-10
type: "notes"  # Options: "lab", "notes", or "blog"
draft: false
---

# My Note Title

Your content here with wikilinks!
```

### 2. Use Wikilink Syntax

**Link to other notes:**
```markdown
[[Another Note]]                    # Basic link
[[Another Note|Custom Display Text] # Link with custom text
```

**Embed images:**
```markdown
![[image.png]]           # Basic image embed
![[image.png|600]]       # Image with width (pixels)
```

**Cross-section links:**
- Notes can link to lab posts and blog posts
- Any section can link to any other section
- Just use the filename: `[[My Lab Post]]`

### 3. Copy to Hugo

Use the bash script to copy your file:

```bash
./scripts/copy-to-hugo.sh /path/to/your/note.md
```

The script will:
- Copy the file to the correct section (`content/lab/`, `content/notes/`, or `content/blog/`)
- Normalize the filename (spaces → hyphens, lowercase)
- Copy any images to `static/images/{section}/`

### 4. Build Your Site

```bash
hugo
```

Or preview locally:

```bash
hugo server
```

## Content Sections

### Lab (`type: "lab"`)
- **Purpose**: Microblog, quick updates
- **URL structure**: `/lab/post-name/`
- **Use for**: Daily thoughts, quick shares, work-in-progress

### Notes (`type: "notes"`)
- **Purpose**: Knowledge base, reference material
- **URL structure**: `/notes/note-name/`
- **Use for**: Documentation, learning notes, ideas

### Blog (`type: "blog"`)
- **Purpose**: Long-form, polished content
- **URL structure**: `/blog/2026/01/post-name/`
- **Use for**: Essays, tutorials, articles

## Obsidian Templates

### Lab Post Template
```markdown
---
title: '{{title}}'
date: {{date}}
type: "lab"
draft: false
---

# {{title}}

{{content}}
```

### Note Template
```markdown
---
title: '{{title}}'
date: {{date}}
type: "notes"
draft: false
---

# {{title}}

{{content}}
```

### Blog Post Template
```markdown
---
title: '{{title}}'
date: {{date}}
type: "blog"
draft: false
description: '{{description}}'
---

# {{title}}

{{content}}
```

## Wikilink Features

✅ **Native Obsidian syntax**: `[[Note Name]]` works out of the box
✅ **Custom display text**: `[[Note Name|Show This Text]]`
✅ **Image embedding**: `![[image.png]]` and `![[image.png|width]]`
✅ **Cross-section linking**: Link from notes to lab/blog posts
✅ **Filename normalization**: Use spaces in filenames, they become URLs
✅ **Broken link detection**: Unlinked pages show as red/dashed

## Image Handling

### In Obsidian
Store images in a subfolder in your vault:
```
ObsidianVault/
├── notes/
│   └── my-note.md
└── images/
    └── screenshot.png
```

### In Markdown
Reference images with:
```markdown
![[screenshot.png]]
![[screenshot.png|800]]  # With width
```

### After Copying
The bash script copies images to:
```
static/images/
├── lab/
├── notes/
└── blog/
```

## Setting Up Keyboard Shortcut in Obsidian

### Option 1: Using Obsidian Commander Plugin
1. Install the "Commander" plugin in Obsidian
2. Create a new command that runs:
   ```bash
   /home/krishnabn/Public/homepage/scripts/copy-to-hugo.sh "%file%"
   ```
3. Assign a hotkey (e.g., Ctrl+Alt+H)

### Option 2: Using System Hotkey
1. Create a keyboard shortcut in your desktop environment
2. Map it to run the script with the current file

## Testing

Test files have been created in your Hugo site:
- `content/notes/test-note.md` - Main test note
- `content/notes/another-test.md` - Backlink test
- `content/lab/test-lab-post.md` - Lab post
- `content/blog/test-blog-post.md` - Blog post

Build and test:

```bash
cd /home/krishnabn/Public/homepage
hugo server
```

Visit `http://localhost:1313/notes/test-note/` to see wikilinks in action!

## Troubleshooting

### Wikilinks not converting?
- Check browser console for errors (F12)
- Verify `wikilinks.js` is loaded (Network tab)
- Make sure you're using `[[Note Name]]` syntax (not `[Note](note.md)`)

### Images not showing?
- Check image path in the markdown
- Verify images were copied to `static/images/{section}/`
- Check browser console for 404 errors

### Broken links?
- Red dashed underlines = page not found
- Check that the target file exists
- Verify the `type:` field in front matter
- Check the filename matches (spaces → hyphens)

### Wrong section?
- Check the `type:` field in front matter
- Must be exactly: `lab`, `notes`, or `blog`

## File Structure

```
/home/krishnabn/Public/homepage/
├── content/
│   ├── _index.md           # Homepage
│   ├── lab/                # Microblog posts
│   ├── notes/              # Knowledge base
│   └── blog/               # Long-form articles
├── static/
│   ├── css/                # Styles
│   ├── js/
│   │   └── wikilinks.js    # Wikilink processor
│   └── images/             # All images
│       ├── lab/
│       ├── notes/
│       └── blog/
├── layouts/
│   ├── partials/
│   │   └── foot_custom.html  # Loads wikilinks.js
│   └── render-hooks/        # (reserved for future use)
├── scripts/
│   └── copy-to-hugo.sh     # Automation script
└── hugo.yaml               # Configuration

```

## Next Steps

1. **Try it out**: Create a test note in Obsidian and copy it
2. **Set up shortcut**: Configure keyboard shortcut in Obsidian
3. **Customize templates**: Add your preferred front matter fields
4. **Start writing**: Use wikilinks to connect your ideas!

## Resources

- [Hugo Documentation](https://gohugo.io/)
- [Obsidian Documentation](https://help.obsidian.md/)
- [Configure Markup](https://gohugo.io/content-management/formats/)
- [Hugo Goldmark Extensions](https://pkg.go.dev/github.com/gohugoio/hugo-goldmark-extensions/extras)

---

**Sources:**
- [Hugo Content Formats Documentation](https://gohugo.io/content-management/formats/)
- [Hugo Markup Configuration](https://gohugo.io/configuration/markup/)
- [让hugo支持wikilink](https://kentxxq.com/posts/%E7%AC%94%E8%AE%B0/%E8%AE%A9hugo%E6%94%AF%E6%8C%81wikilink/) - Chinese implementation guide
- [Hugo Goldmark Extensions Package](https://pkg.go.dev/github.com/gohugoio/hugo-goldmark-extensions/extras)
