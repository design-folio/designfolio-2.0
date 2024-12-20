import { UploadCloud, FileCheck } from "lucide-react";
import { Card } from "@/components/ui-interviewGuru/card";
import { useState } from "react";

interface FileUploadProps {
  accept: string;
  onChange: (file: File) => void;
  label: string;
}

const FileUpload = ({ accept, onChange, label }: FileUploadProps) => {
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsFileUploaded(true);
      setFileName(file.name);
      onChange(file);
    }
  };

  return (
    <Card className={`p-6 border-2 border-dashed transition-colors ${isFileUploaded ? 'border-green-500 bg-green-50' : 'hover:border-primary/50'}`}>
      <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          {isFileUploaded ? (
            <>
              <FileCheck className="w-12 h-12 text-green-500 mb-2" />
              <p className="text-sm text-green-600">File uploaded: {fileName}</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">{label}</p>
            </>
          )}
        </div>
      </label>
    </Card>
  );
};

export default FileUpload;