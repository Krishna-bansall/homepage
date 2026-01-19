#!/bin/bash
#
# copy-to-hugo.sh - Copy Obsidian notes to Hugo content directory
# Usage: ./copy-to-hugo.sh <file_path>
#

set -e

# Configuration
HUGO_SITE="/home/krishnabn/Public/homepage"
STATIC_DIR="$HUGO_SITE/static"

# Check if file path is provided
if [ -z "$1" ]; then
    echo "❌ Error: No file path provided"
    echo "Usage: $0 <path_to_markdown_file>"
    exit 1
fi

SOURCE_FILE="$1"
FILENAME=$(basename "$SOURCE_FILE")

# Check if file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Error: File not found: $SOURCE_FILE"
    exit 1
fi

# Extract front matter to determine section
SECTION=$(grep -m 1 '^type:' "$SOURCE_FILE" 2>/dev/null | sed 's/type: //' | tr -d '[:space:]' || echo "")

# Default to 'notes' if no type specified
if [ -z "$SECTION" ]; then
    SECTION="notes"
    echo "⚠️  No 'type:' found in front matter, defaulting to 'notes'"
fi

# Validate section
if [[ ! "$SECTION" =~ ^(lab|notes|blog)$ ]]; then
    echo "❌ Error: Invalid type '$SECTION'. Must be: lab, notes, or blog"
    exit 1
fi

# Destination directory
DEST_DIR="$HUGO_SITE/content/$SECTION"

# Create destination if it doesn't exist
mkdir -p "$DEST_DIR"

# Normalize filename: spaces and underscores to hyphens, lowercase
DEST_FILENAME=$(echo "$FILENAME" | sed 's/ /-/g' | sed 's/_/-/g' | tr '[:upper:]' '[:lower:]')
DEST_FILE="$DEST_DIR/$DEST_FILENAME"

# Copy the markdown file
cp "$SOURCE_FILE" "$DEST_FILE"
echo "✅ Copied: $SOURCE_FILE → $DEST_FILE"

# Extract and copy images if any
# Look for ![[image.png]] or ![image.png](path) syntax
IMAGES=$(grep -oE '!\[\[([^\]]+)\]|!\[([^\]]+)\]\([^\)]+\)' "$SOURCE_FILE" 2>/dev/null | sed 's/!\[\[//' | sed 's/]]//' | sed 's/!\[.*\](//' | sed 's/)$//' | cut -d'|' -f1 | grep -v '^$' || true)

if [ -n "$IMAGES" ]; then
    echo ""
    echo "📷 Processing images..."

    # Create section static directory
    mkdir -p "$STATIC_DIR/$SECTION"

    # Get source directory
    SOURCE_DIR=$(dirname "$SOURCE_FILE")

    while IFS= read -r image; do
        # Skip if image path is empty
        [ -z "$image" ] && continue

        # Skip if it's a URL
        if [[ "$image" =~ ^https?:// ]]; then
            echo "  ⚠️  Skipping URL: $image"
            continue
        fi

        # Get image filename only
        IMAGE_NAME=$(basename "$image")

        # Try to find the image in assets folder first
        FOUND=0

        # Check assets/ folder (Obsidian's default attachment folder)
        if [ -f "$SOURCE_DIR/assets/$IMAGE_NAME" ]; then
            cp "$SOURCE_DIR/assets/$IMAGE_NAME" "$STATIC_DIR/$SECTION/$IMAGE_NAME"
            echo "  ✅ Copied: assets/$IMAGE_NAME → $STATIC_DIR/$SECTION/$IMAGE_NAME"
            FOUND=1
        # Check if image exists relative to source file
        elif [ -f "$SOURCE_DIR/$image" ]; then
            cp "$SOURCE_DIR/$image" "$STATIC_DIR/$SECTION/$IMAGE_NAME"
            echo "  ✅ Copied: $image → $STATIC_DIR/$SECTION/$IMAGE_NAME"
            FOUND=1
        # Check if image exists with just filename in source dir
        elif [ -f "$SOURCE_DIR/$IMAGE_NAME" ]; then
            cp "$SOURCE_DIR/$IMAGE_NAME" "$STATIC_DIR/$SECTION/$IMAGE_NAME"
            echo "  ✅ Copied: $IMAGE_NAME → $STATIC_DIR/$SECTION/$IMAGE_NAME"
            FOUND=1
        else
            echo "  ⚠️  Warning: Image not found: $image"
        fi
    done <<< "$IMAGES"
fi

echo ""
echo "🎉 Done! Your content has been copied to Hugo."
echo "   Section: $SECTION"
echo "   File: $DEST_FILENAME"
echo ""
echo "💡 To build your site, run: cd $HUGO_SITE && hugo"
