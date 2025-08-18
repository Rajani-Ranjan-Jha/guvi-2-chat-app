"use client";
import React, { useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

const CustomEmojiPicker = React.memo(({ 
  onEmojiSelect, 
  onClose, 
  theme = 'dark',
  previewConfig = { showPreview: false },
  searchDisabled = false,
  skinTonesDisabled = false,
  width = 350,
  height = 450 
}) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const handleEmojiClick = (emojiData, event) => {
    // emojiData contains: emoji, unified, names, etc.
    onEmojiSelect(emojiData.emoji);
    // onClose();
  };

  return (
    <div 
      ref={pickerRef} 
      className="emoji-picker-container"
    //   className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
    >
      <EmojiPicker
        onEmojiClick={handleEmojiClick}
        theme={theme}
        previewConfig={previewConfig}
        searchDisabled={searchDisabled}
        skinTonesDisabled={skinTonesDisabled}
        lazyLoadEmojis={true}
        categories={[
          {
            name: "Smileys & People",
            category: "smileys_people"
          },
          {
            name: "Animals & Nature", 
            category: "animals_nature"
          },
          {
            name: "Food & Drink",
            category: "food_drink"
          },
          {
            name: "Travel & Places",
            category: "travel_places"
          },
          {
            name: "Activities",
            category: "activities"
          },
          {
            name: "Objects",
            category: "objects"
          },
          {
            name: "Symbols",
            category: "symbols"
          },
          {
            name: "Flags",
            category: "flags"
          }
        ]}
      />
    </div>
  );

});

export default CustomEmojiPicker;