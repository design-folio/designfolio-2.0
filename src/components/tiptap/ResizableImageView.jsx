import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Move, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const ResizableImageView = ({ node, updateAttributes, editor, selected }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [showAltInput, setShowAltInput] = useState(false);
  const [altText, setAltText] = useState(node.attrs.alt || '');
  const imageRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Default alignment to 'left' if not set
  const alignment = node.attrs.alignment || 'left';

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = imageRef.current?.offsetWidth || 0;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e) => {
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(100, startWidthRef.current + diff);
      
      if (imageRef.current) {
        updateAttributes({
          width: newWidth,
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, updateAttributes]);

  const handleAltSave = () => {
    updateAttributes({ alt: altText });
    setShowAltInput(false);
  };

  const handleAltCancel = () => {
    setAltText(node.attrs.alt || '');
    setShowAltInput(false);
  };

  const setAlignment = (align) => {
    updateAttributes({ alignment: align });
  };

  const getWrapperAlignment = () => {
    if (alignment === 'center') return 'mx-auto';
    if (alignment === 'right') return 'ml-auto';
    return 'mr-auto';
  };

  return (
    <NodeViewWrapper className="resizable-image-wrapper">
      <div
        className={`relative block my-4 ${getWrapperAlignment()}`}
        style={{
          maxWidth: '100%',
          width: node.attrs.width ? `${node.attrs.width}px` : 'auto',
        }}
      >
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          className={`block w-full h-auto rounded-lg ${selected ? 'shadow-xl' : ''}`}
          style={{
            cursor: isResizing ? 'ew-resize' : 'default',
          }}
        />
        
        {editor.isEditable && selected && !showAltInput && (
          <>
            {/* Resize handle */}
            <div
              className="absolute -bottom-3 -right-3 w-8 h-8 bg-blue-500 rounded-full cursor-nwse-resize flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors group"
              onMouseDown={handleMouseDown}
              style={{ border: '2px solid white' }}
            >
              <Move size={14} className="text-white" />
            </div>

            {/* Alignment buttons */}
            <div className="absolute top-2 right-2 flex gap-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1">
              <button
                onClick={() => setAlignment('left')}
                className={`p-1.5 rounded transition-colors ${
                  alignment === 'left'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align left"
              >
                <AlignLeft size={14} />
              </button>
              <button
                onClick={() => setAlignment('center')}
                className={`p-1.5 rounded transition-colors ${
                  alignment === 'center'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align center"
              >
                <AlignCenter size={14} />
              </button>
              <button
                onClick={() => setAlignment('right')}
                className={`p-1.5 rounded transition-colors ${
                  alignment === 'right'
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Align right"
              >
                <AlignRight size={14} />
              </button>
            </div>

            {/* Alt text button */}
            <button
              onClick={() => setShowAltInput(true)}
              className="absolute top-2 left-2 px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {node.attrs.alt ? 'Edit Alt' : 'Add Alt'}
            </button>
          </>
        )}

        {showAltInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-md w-full">
              <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Image Alt Text
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Describe this image for accessibility and SEO
              </p>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g., Product screenshot showing dashboard..."
                autoFocus
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 mb-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAltSave();
                  if (e.key === 'Escape') handleAltCancel();
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleAltCancel}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAltSave}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ResizableImageView;
