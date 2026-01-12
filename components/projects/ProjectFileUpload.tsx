import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, File, X, FileText, Image, Archive, Video } from 'lucide-react';
import { ProjectAttachment } from '../../types';

interface ProjectFileUploadProps {
  projectId: string;
  currentUserId: string;
  onFilesUploaded: (attachments: ProjectAttachment[]) => void;
  maxFileSize?: number; // in bytes, default 10MB
  acceptedFileTypes?: string[];
}

export function ProjectFileUpload({ 
  projectId, 
  currentUserId, 
  onFilesUploaded,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg',
    '.zip', '.rar', '.7z',
    '.mp4', '.avi', '.mov', '.wmv',
    '.txt', '.csv'
  ]
}: ProjectFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) {
      return <Archive className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxFileSize)}.`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      return `File type "${fileExtension}" is not supported.`;
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setError('');

    // Validate each file
    for (const file of selectedFiles) {
      const validation = validateFile(file);
      if (validation) {
        setError(validation);
        return;
      }
    }

    // Check for duplicate file names
    const existingNames = files.map(f => f.name);
    const newFiles = selectedFiles.filter(file => !existingNames.includes(file.name));
    const duplicates = selectedFiles.filter(file => existingNames.includes(file.name));

    if (duplicates.length > 0) {
      setError(`Files with the same names already selected: ${duplicates.map(f => f.name).join(', ')}`);
      return;
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Simulate file upload process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create attachment objects
      const newAttachments: ProjectAttachment[] = files.map(file => ({
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: currentUserId,
        uploadedAt: new Date().toISOString(),
        url: `mock://uploads/${projectId}/${file.name}` // In real app, this would be the actual file URL
      }));

      onFilesUploaded(newAttachments);
      setFiles([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Project Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select Files</Label>
          <Input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            multiple
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground">
            Supported formats: {acceptedFileTypes.slice(0, 5).join(', ')}
            {acceptedFileTypes.length > 5 && ` and ${acceptedFileTypes.length - 5} more`}
          </p>
          <p className="text-sm text-muted-foreground">
            Maximum file size: {formatFileSize(maxFileSize)}
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files ({files.length})</Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.type)}
                    <div className="min-w-0">
                      <p className="text-sm truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>
          
          {files.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setFiles([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
                setError('');
              }}
              disabled={uploading}
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <p><strong>Note:</strong> This is a demo implementation. In a real application, files would be uploaded to a secure cloud storage service.</p>
        </div>
      </CardContent>
    </Card>
  );
}