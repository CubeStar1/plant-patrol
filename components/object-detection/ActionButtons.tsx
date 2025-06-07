import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Eye, EyeOff, SwitchCamera, Zap, RefreshCw, Upload, FileImage, ToggleLeft, ToggleRight } from 'lucide-react';

interface ActionButtonsProps {
  detectionMode: 'camera' | 'image' | 'video';
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSetDetectionMode: (mode: 'camera' | 'image' | 'video') => void; // Changed from onToggleDetectionMode
  onProcessUploadedImage: () => void;
  isImageLoaded: boolean;
  onVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessUploadedVideo: () => void;
  onStopProcessingVideo: () => void; // New prop
  isVideoLoaded: boolean;
  isProcessingVideo: boolean; // New prop
  isLiveDetecting: boolean;
  onCapture: () => void;
  onToggleLiveDetection: () => void;
  onFlipCamera: () => void;
  onChangeModel: () => void;
  onResetView: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isLiveDetecting,
  onCapture,
  onToggleLiveDetection,
  onFlipCamera,
  onChangeModel,
  onResetView,
  detectionMode,
  onImageUpload,
  onSetDetectionMode, // Changed from onToggleDetectionMode
  onProcessUploadedImage,
  isImageLoaded,
  onVideoUpload,
  onProcessUploadedVideo,
  onStopProcessingVideo, // New prop
  isVideoLoaded,
  isProcessingVideo, // New prop
}) => {
  return (
    <div className="space-y-3">
      <input
        type="file"
        id="imageUploadInput"
        accept="image/*"
        onChange={onImageUpload} // For image uploads
        style={{ display: 'none' }}
      />
      <input
        type="file"
        id="videoUploadInput"
        accept="video/*"
        onChange={onVideoUpload}
        style={{ display: 'none' }}
      />
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Button onClick={() => onSetDetectionMode('camera')} variant={detectionMode === 'camera' ? 'default' : 'outline'} className="w-full">
          <Camera className="mr-2 h-4 w-4" /> Camera
        </Button>
        <Button onClick={() => onSetDetectionMode('image')} variant={detectionMode === 'image' ? 'default' : 'outline'} className="w-full">
          <FileImage className="mr-2 h-4 w-4" /> Image
        </Button>
        <Button onClick={() => onSetDetectionMode('video')} variant={detectionMode === 'video' ? 'default' : 'outline'} className="w-full">
          <Upload className="mr-2 h-4 w-4" /> Video {/* Using Upload icon for video mode button */}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
                <Button
          onClick={onCapture}
          variant="secondary"
          className="w-full"
          disabled={detectionMode === 'image' || detectionMode === 'video'}
        >
          <Camera className="mr-2 h-4 w-4" /> Capture
        </Button>
                <Button
          onClick={onToggleLiveDetection}
          variant={isLiveDetecting ? 'destructive' : 'default'}
          className={`w-full ${isLiveDetecting ? '' : 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white'}`}
          disabled={detectionMode === 'image' || detectionMode === 'video'}
        >
          {isLiveDetecting ? (
            <><EyeOff className="mr-2 h-4 w-4" /> Stop Live</>
          ) : (
            <><Eye className="mr-2 h-4 w-4" /> Start Live</>
          )}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
                <Button
          onClick={onFlipCamera}
          variant="outline"
          className="w-full"
          disabled={detectionMode === 'image' || detectionMode === 'video'}
        >
          <SwitchCamera className="mr-2 h-4 w-4" /> Flip Cam
        </Button>
        <Button
          onClick={onChangeModel}
          variant="outline"
          className="w-full"
        >
          <Zap className="mr-2 h-4 w-4" /> Model Options
        </Button>
      </div>
      <Button
        onClick={onResetView}
        variant="destructive"
        className="w-full"
      >
        <RefreshCw className="mr-2 h-4 w-4" /> Reset View
      </Button>

      {detectionMode === 'image' && (
        <div className="space-y-3 pt-3 border-t border-muted">
          <Button
            onClick={() => document.getElementById('imageUploadInput')?.click()}
            variant="outline"
            className="w-full"
          >
            <FileImage className="mr-2 h-4 w-4" /> Upload Image
          </Button>
          <Button
            onClick={onProcessUploadedImage}
            variant="default"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white"
            disabled={!isImageLoaded}
          >
            <Zap className="mr-2 h-4 w-4" /> Process Uploaded Image
          </Button>
        </div>
      )}

      {detectionMode === 'video' && (
        <div className="space-y-3 pt-3 border-t border-muted">
          <Button
            onClick={() => document.getElementById('videoUploadInput')?.click()}
            variant="outline"
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Video
          </Button>
          <Button
            onClick={isProcessingVideo ? onStopProcessingVideo : onProcessUploadedVideo}
            variant="default"
            className={`w-full ${isProcessingVideo ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-500 hover:bg-purple-600'} text-white`}
            disabled={!isVideoLoaded && !isProcessingVideo} // Disabled if no video loaded (unless already processing)
          >
            {isProcessingVideo ? <><EyeOff className="mr-2 h-4 w-4" /> Stop Processing</> : <><Zap className="mr-2 h-4 w-4" /> Process Uploaded Video</>}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;
