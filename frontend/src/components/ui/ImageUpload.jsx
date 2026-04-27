import React, { useRef, useState } from "react";

const ImageUpload = ({ onUpload, multiple = false, single = false }) => {
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const allowMultiple = single ? false : multiple;

  const handleChange = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0 || typeof onUpload !== "function") {
      return;
    }

    setIsLoading(true);
    try {
      await onUpload(allowMultiple ? selectedFiles : [selectedFiles[0]]);
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={allowMultiple}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="inline-flex items-center rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Uploading..." : allowMultiple ? "Choose Images" : "Choose Image"}
      </button>
    </div>
  );
};

export default ImageUpload;
