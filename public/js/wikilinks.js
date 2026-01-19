(function() {
  'use strict';

  // Page index - loaded instantly from pre-built data
  const allPages = new Map();

  // Load pre-built page index (instant, no network request)
  function loadPageIndex() {
    const indexEl = document.getElementById('page-index');
    if (!indexEl) return;

    try {
      const data = JSON.parse(indexEl.textContent);
      if (data.pages) {
        data.pages.forEach(p => {
          // Store by full slug
          allPages.set(p.s, p.u);
          // Store by basename for simpler lookups
          if (p.b && p.b !== p.s) {
            allPages.set(p.b, p.u);
          }
        });
      }
    } catch (e) {
      console.warn('Could not parse page index:', e);
    }
  }

  // Get current section from URL
  function getCurrentSection() {
    const path = window.location.pathname;
    if (path.startsWith('/notes/')) return 'notes';
    if (path.startsWith('/lab/')) return 'lab';
    if (path.startsWith('/blog/')) return 'blog';
    return null;
  }

  // Convert wikilinks and image embeds
  function convertWikilinks() {
    const currentSection = getCurrentSection();
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (!text || (!text.includes('[[') && !text.includes('![['))) return;

        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        const regex = /(!?)\[\[([^\]]+)\]\]/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
          const [fullMatch, imageMark, content] = match;
          const index = match.index;

          // Add text before the match
          if (index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex, index)));
          }

          const isImage = imageMark === '!';

          if (isImage) {
            // Handle ![[image.png|size]] or ![[image.png]]
            let imageName = content;
            let size = null;

            if (content.includes('|')) {
              const parts = content.split('|');
              imageName = parts[0].trim();
              size = parts[1].trim();
            }

            const img = document.createElement('img');
            const cleanImageName = imageName.replace(/^\//, '');

            // Build image paths
            let imagePath = currentSection
              ? `/${currentSection}/assets/${cleanImageName}`
              : `/${cleanImageName}`;
            let fallbackPath = currentSection
              ? `/${currentSection}/${cleanImageName}`
              : null;

            img.src = imagePath;
            img.alt = imageName;
            img.loading = 'lazy';
            if (size) img.style.maxWidth = size;
            img.style.height = 'auto';
            img.style.display = 'block';
            img.style.margin = '1.5em 0';

            // Handle fallback
            if (fallbackPath) {
              img.onerror = function() {
                if (this.src !== fallbackPath) this.src = fallbackPath;
              };
            }

            fragment.appendChild(img);
          } else {
            // Handle [[link]] or [[link|text]]
            let linkTarget = content;
            let displayText = content;

            if (content.includes('|')) {
              const parts = content.split('|');
              linkTarget = parts[0].trim();
              displayText = parts[1].trim();
            }

            // Normalize: spaces/underscores to hyphens, lowercase
            const slug = linkTarget.toLowerCase().replace(/[_ ]+/g, '-');

            // Find the page
            let href = allPages.get(slug) ||
                       allPages.get('notes/' + slug) ||
                       allPages.get('lab/' + slug) ||
                       allPages.get('blog/' + slug);

            // Try partial match
            if (!href) {
              for (const [key, value] of allPages) {
                if (key.endsWith('/' + slug) || key.endsWith('-' + slug)) {
                  href = value;
                  break;
                }
              }
            }

            const link = document.createElement('a');
            link.textContent = displayText;
            link.className = 'wikilink';

            if (href) {
              link.href = href;
            } else {
              link.href = '#';
              link.classList.add('broken');
              link.title = `Page not found: ${linkTarget}`;
            }

            fragment.appendChild(link);
          }

          lastIndex = index + fullMatch.length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        if (fragment.childNodes.length > 0) {
          node.parentNode.replaceChild(fragment, node);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName;
        if (tag === 'CODE' || tag === 'PRE' || tag === 'SCRIPT' || tag === 'STYLE' || tag === 'A') {
          return;
        }
        Array.from(node.childNodes).forEach(processNode);
      }
    }

    processNode(mainContent);
  }

  // Initialize immediately (synchronous, no waiting)
  function init() {
    loadPageIndex();
    convertWikilinks();
  }

  // Run as soon as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
