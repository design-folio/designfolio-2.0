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

