/**
 * Extract plain text from TipTap JSON format
 * @param {Object|string} content - TipTap JSON object or HTML/plain text string
 * @returns {string} Plain text extracted from the content
 */
export function extractTextFromTipTap(content) {
    if (!content) return '';

    // If it's a TipTap JSON object
    if (typeof content === 'object' && content !== null) {
        const extractText = (node) => {
            if (!node) return '';

            // If it's a text node, return the text
            if (node.type === 'text' && node.text) {
                return node.text;
            }

            // If it has content array, recursively extract text
            if (node.content && Array.isArray(node.content)) {
                return node.content.map(extractText).join('');
            }

            return '';
        };

        return extractText(content);
    }

    // If it's a string (for backward compatibility)
    if (typeof content === 'string') {
        // Check if it's already plain text (no HTML tags)
        if (!/<[a-z][\s\S]*>/i.test(content)) {
            return content;
        }
        // Remove HTML tags
        if (typeof window !== 'undefined') {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = content;
            return tempDiv.textContent || '';
        }
        // Fallback for SSR
        return content.replace(/<[^>]*>/g, '');
    }

    return '';
}

/**
 * Get plain text length from TipTap JSON or HTML/plain text for truncation check
 * @param {Object|string} content - TipTap JSON object or HTML/plain text string
 * @returns {number} Length of plain text
 */
export function getPlainTextLength(content) {
    return extractTextFromTipTap(content).length;
}

export function tiptapToDisplayString(content) {
    if (!content) return '';

    if (typeof content === 'string') {
        if (!/<[a-z][\s\S]*>/i.test(content)) return content;
        if (typeof window !== 'undefined') {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = content;
            return tempDiv.textContent || '';
        }
        return content.replace(/<[^>]*>/g, '');
    }

    if (typeof content !== 'object' || content === null) return '';

    const getTextFromContent = (nodes) => {
        if (!nodes || !Array.isArray(nodes)) return '';
        return nodes.map((n) => {
            if (n.type === 'text' && n.text) return n.text;
            if (n.content) return getTextFromContent(n.content);
            return '';
        }).join('');
    };

    const walk = (node) => {
        if (!node) return '';

        if (node.type === 'text' && node.text) return node.text;

        if (node.type === 'bulletList' && node.content) {
            return node.content.map((item) => {
                const text = getTextFromContent(item.content || []);
                return text ? `- ${text.trim()}` : '';
            }).filter(Boolean).join('\n');
        }

        if (node.type === 'orderedList' && node.content) {
            return node.content.map((item, i) => {
                const text = getTextFromContent(item.content || []);
                return text ? `${i + 1}. ${text.trim()}` : '';
            }).filter(Boolean).join('\n');
        }

        if (node.type === 'listItem') {
            return getTextFromContent(node.content || []);
        }

        if (node.content && Array.isArray(node.content)) {
            const parts = node.content.map(walk).filter(Boolean);
            const joined = parts.join('');
            // Block nodes: add newline after
            const blockTypes = ['paragraph', 'heading', 'blockquote', 'codeBlock', 'bulletList', 'orderedList'];
            if (blockTypes.includes(node.type) && joined) return joined + '\n';
            return joined;
        }

        return '';
    };

    const doc = content.type === 'doc' ? content : content;
    const out = (doc.content || []).map(walk).join('').trim();
    return out.replace(/\n{3,}/g, '\n\n');
}

