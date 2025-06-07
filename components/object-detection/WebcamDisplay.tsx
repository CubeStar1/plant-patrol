import React from 'react';
import Webcam from 'react-webcam';

interface WebcamDisplayProps {
  detectionMode: 'camera' | 'image' | 'video';
  uploadedImageSrc: string | null;
  uploadedVideoSrc: string | null;
  webcamRef: React.RefObject<Webcam>;
  videoCanvasRef: React.RefObject<HTMLCanvasElement>;
  facingMode: string;
  onLoadedMetadata: () => void;
  // width?: number | string;
  // height?: number | string;
}

const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
  webcamRef,
  videoCanvasRef,
  facingMode,
  onLoadedMetadata,
  detectionMode,
  uploadedImageSrc,
  uploadedVideoSrc,
  // width,
  // height,
}) => {
  return (
    <div className="md:col-span-2 relative flex items-center justify-center bg-muted rounded-lg overflow-hidden shadow-lg min-h-[400px] md:min-h-[500px] aspect-[4/3]">
      {detectionMode === 'camera' && (
        <Webcam
          mirrored={facingMode === 'user'}
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          imageSmoothing={true}
          videoConstraints={{
            facingMode: facingMode,
            // width: width, 
            // height: height,
          }}
          onLoadedMetadata={onLoadedMetadata}
          forceScreenshotSourceSize={true}
          className="w-full h-full object-cover"
        />
      )}
      {detectionMode === 'video' && uploadedVideoSrc && (
        <video
          src={uploadedVideoSrc}
          controls
          autoPlay
          // onLoadedMetadata={onLoadedMetadata} // Consider if needed for video, might conflict with webcam's
          className="w-full h-full object-contain"
        />
      )}
      {/* The canvas is always present for drawing either webcam feed or uploaded image + detections */}
      <canvas
        id="cv1"
        ref={videoCanvasRef}
        className="absolute top-0 left-0 w-full h-full z-10 bg-transparent"
      ></canvas>
    </div>
  );
};

export default WebcamDisplay;
