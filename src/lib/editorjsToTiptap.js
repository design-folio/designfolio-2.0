/**
 * Convert EditorJS JSON format to Tiptap JSON format
 * @param {Object} editorjsData - EditorJS data structure with blocks array
 * @returns {Object} Tiptap JSON structure
 */
export function convertEditorJSToTiptap(editorjsData) {
  if (!editorjsData || !editorjsData.blocks) {
    return {
      type: 'doc',
      content: []
    };
  }

  const tiptapContent = {
    type: 'doc',
    content: []
  };

  editorjsData.blocks.forEach(block => {
    const converted = convertBlock(block);
    if (converted) {
      tiptapContent.content.push(converted);
    }
  });

  return tiptapContent;
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Parse inline HTML content to Tiptap marks
 */
function parseInlineContent(html) {
  if (!html) return [{ type: 'text', text: '' }];

  const content = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) {
        content.push({
          type: 'text',
          text: node.textContent
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const marks = [];

      // Detect marks based on HTML tags
      if (node.tagName === 'B' || node.tagName === 'STRONG') {
        marks.push({ type: 'bold' });
      }
      if (node.tagName === 'I' || node.tagName === 'EM') {
        marks.push({ type: 'italic' });
      }
      if (node.tagName === 'U') {
        marks.push({ type: 'underline' });
      }
      if (node.tagName === 'MARK') {
        marks.push({ type: 'highlight' });
      }
      if (node.tagName === 'CODE') {
        marks.push({ type: 'code' });
      }
      if (node.tagName === 'A') {
        marks.push({
          type: 'link',
          attrs: {
            href: node.getAttribute('href'),
            target: node.getAttribute('target') || null
          }
        });
      }

      // Process child nodes
      if (node.childNodes.length > 0) {
        Array.from(node.childNodes).forEach(child => {
          if (child.nodeType === Node.TEXT_NODE && child.textContent) {
            content.push({
              type: 'text',
              text: child.textContent,
              marks: marks.length > 0 ? marks : undefined
            });
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            processNode(child);
          }
        });
      }
    }
  }

  Array.from(tempDiv.childNodes).forEach(processNode);

  return content.length > 0 ? content : [{ type: 'text', text: '' }];
}

/**
 * Convert a single EditorJS block to Tiptap node
 */
function convertBlock(block) {
  switch (block.type) {
    case 'header':
      return {
        type: 'heading',
        attrs: {
          level: block.data.level || 2
        },
        content: parseInlineContent(block.data.text)
      };

    case 'paragraph':
      return {
        type: 'paragraph',
        content: parseInlineContent(block.data.text)
      };

    case 'list':
      return convertList(block.data);

    case 'image':
      return {
        type: 'image',
        attrs: {
          src: block.data.file?.url || block.data.file?.key || '',
          alt: block.data.caption || null,
          title: block.data.caption || null
        }
      };

    case 'table':
      return convertTable(block.data);

    case 'embed':
      return convertEmbed(block.data);

    case 'figma':
      return {
        type: 'figma',
        attrs: {
          src: block.data.url || ''
        }
      };

    case 'delimiter':
      return {
        type: 'horizontalRule'
      };

    case 'breakLine':
      return {
        type: 'hardBreak'
      };

    case 'code':
      return {
        type: 'codeBlock',
        attrs: {
          language: block.data.language || null
        },
        content: [{
          type: 'text',
          text: block.data.code || ''
        }]
      };

    case 'quote':
      return {
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          content: parseInlineContent(block.data.text)
        }]
      };

    default:
      // For unknown blocks, try to preserve as paragraph
      if (block.data.text) {
        return {
          type: 'paragraph',
          content: parseInlineContent(block.data.text)
        };
      }
      return null;
  }
}

/**
 * Convert EditorJS list to Tiptap list
 */
function convertList(data) {
  const listType = data.style === 'ordered' ? 'orderedList' : 'bulletList';

  function convertListItems(items) {
    return items.map(item => {
      const listItem = {
        type: 'listItem',
        content: []
      };

      // Add the content
      if (item.content) {
        listItem.content.push({
          type: 'paragraph',
          content: parseInlineContent(item.content)
        });
      }

      // Add nested items if they exist
      if (item.items && item.items.length > 0) {
        const nestedList = {
          type: listType,
          content: convertListItems(item.items)
        };
        listItem.content.push(nestedList);
      }

      return listItem;
    });
  }

  return {
    type: listType,
    content: convertListItems(data.items || [])
  };
}

/**
 * Convert EditorJS table to Tiptap table
 */
function convertTable(data) {
  const rows = data.content || [];

  return {
    type: 'table',
    content: rows.map((row, rowIndex) => ({
      type: 'tableRow',
      content: row.map(cell => ({
        type: rowIndex === 0 ? 'tableHeader' : 'tableCell',
        attrs: {},
        content: [{
          type: 'paragraph',
          content: parseInlineContent(cell)
        }]
      }))
    }))
  };
}

/**
 * Convert EditorJS embed to Tiptap YouTube (or iframe)
 */
function convertEmbed(data) {
  const url = data.embed || data.source || '';

  // Check if it's a YouTube URL
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // Extract YouTube video ID
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URL(url).searchParams;
      videoId = urlParams.get('v');
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
    }

    if (videoId) {
      return {
        type: 'youtube',
        attrs: {
          src: `https://www.youtube.com/watch?v=${videoId}`
        }
      };
    }
  }

  // For other embeds, create a paragraph with a link
  return {
    type: 'paragraph',
    content: [{
      type: 'text',
      text: url,
      marks: [{
        type: 'link',
        attrs: {
          href: url,
          target: '_blank'
        }
      }]
    }]
  };
}
