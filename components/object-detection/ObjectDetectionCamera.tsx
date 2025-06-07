import Webcam from "react-webcam";
import { useRef, useState, useEffect } from "react";
import { runModelUtils } from "@/utils";
import { Tensor } from "onnxruntime-web";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings2, Zap as LoadingZapIcon } from 'lucide-react'; // Renamed Zap to LoadingZapIcon to avoid conflict
import WebcamDisplay from './WebcamDisplay';
import { Button } from "@/components/ui/button"; // Added for upload button
import ActionButtons from './ActionButtons';
import StatsDisplay from './StatsDisplay';

const WebcamComponent = (props: any) => {
  const [inferenceTime, setInferenceTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const webcamRef = useRef<Webcam>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const liveDetection = useRef<boolean>(false);
  const [isLiveDetecting, setIsLiveDetecting] = useState<boolean>(false);
  const [detectionMode, setDetectionMode] = useState<'camera' | 'image' | 'video'>('camera'); // Renamed 'upload' to 'image'
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedImageElement, setUploadedImageElement] = useState<HTMLImageElement | null>(null);
  const [uploadedVideoSrc, setUploadedVideoSrc] = useState<string | null>(null);
  const [uploadedVideoElement, setUploadedVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState<boolean>(false);
  const animationFrameIdRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  const [facingMode, setFacingMode] = useState<string>("environment");
  const originalSize = useRef<number[]>([0, 0]);

  const capture = () => {
    const canvas = videoCanvasRef.current!;
    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    })!;

    if (facingMode === "user") {
      context.setTransform(-1, 0, 0, 1, canvas.width, 0);
    }

    context.drawImage(
      webcamRef.current!.video!,
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (facingMode === "user") {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
    return context;
  };

  const runModel = async (ctx: CanvasRenderingContext2D) => {
    const data = props.preprocess(ctx);
    let outputTensor: Tensor;
    let inferenceTime: number;
    [outputTensor, inferenceTime] = await runModelUtils.runModel(
      props.session,
      data
    );

    props.postprocess(outputTensor, props.inferenceTime, ctx);
    setInferenceTime(inferenceTime);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await reset(); // Reset previous state
    setDetectionMode('image');
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgSrc = e.target?.result as string;
        setUploadedImageSrc(imgSrc);
        const img = new Image();
        img.onload = () => {
          setUploadedImageElement(img);
          displayUploadedImage(img);
        };
        img.src = imgSrc;
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; // Reset file input
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    await reset(); // Reset previous state
    setDetectionMode('video');
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const videoSrc = e.target?.result as string;
        setUploadedVideoSrc(videoSrc);
        // HTMLVideoElement will be created and handled by WebcamDisplay or directly manipulated for processing
        // For now, just setting the source is enough to enable the 'Process Video' button via isVideoLoaded
        // We might need a ref to the video element if we want to control playback from here
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
            setUploadedVideoElement(video);
            // Potentially call a displayUploadedVideo if needed, or let WebcamDisplay handle it
            originalSize.current = [video.videoWidth, video.videoHeight]; // Store original video dimensions
            if (videoCanvasRef.current) {
                videoCanvasRef.current.width = video.videoWidth;
                videoCanvasRef.current.height = video.videoHeight;
            }
        };
        video.src = videoSrc;
      };
      reader.readAsDataURL(file);
    }
    event.target.value = ''; // Reset file input
  };

  const videoProcessingLoop = async () => {
    console.log("videoProcessingLoop: Entered. isProcessingRef:", isProcessingRef.current, "Paused:", uploadedVideoElement?.paused, "Ended:", uploadedVideoElement?.ended);
    if (!isProcessingRef.current || !uploadedVideoElement || !videoCanvasRef.current || uploadedVideoElement.paused || uploadedVideoElement.ended) {
      if (isProcessingRef.current) { // If it was supposed to be processing, update state and ref
        setIsProcessingVideo(false);
        isProcessingRef.current = false;
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }

    const canvas = videoCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Failed to get 2D context from video canvas for processing loop");
      setIsProcessingVideo(false);
      isProcessingRef.current = false;
      return;
    }

    // Ensure canvas dimensions match video (should be set on video load)
    if (canvas.width !== uploadedVideoElement.videoWidth || canvas.height !== uploadedVideoElement.videoHeight) {
        canvas.width = uploadedVideoElement.videoWidth;
        canvas.height = uploadedVideoElement.videoHeight;
        console.log("videoProcessingLoop: Canvas resized to", canvas.width, "x", canvas.height);
    }

    ctx.drawImage(uploadedVideoElement, 0, 0, canvas.width, canvas.height);
    console.log("videoProcessingLoop: Frame drawn. Calling runModel...");
    try {
      await runModel(ctx);
      console.log("videoProcessingLoop: runModel completed.");
    } catch (error) {
      console.error("videoProcessingLoop: Error in runModel:", error);
      setIsProcessingVideo(false);
      isProcessingRef.current = false; // Ensure ref is also set on error
      return; // Exit loop on error
    }

    if (isProcessingRef.current) {
      animationFrameIdRef.current = requestAnimationFrame(videoProcessingLoop);
    } else {
      // If ref became false (e.g., user clicked stop or an error occurred), ensure state is also false
      setIsProcessingVideo(false);
      console.log("videoProcessingLoop: Exiting due to stop condition. isProcessingRef:", isProcessingRef.current, "isProcessingVideoState:", isProcessingVideo);
    }
  };

  const handleStopProcessingVideo = () => {
    setIsProcessingVideo(false);
    isProcessingRef.current = false;
    if (uploadedVideoElement) {
      uploadedVideoElement.pause();
    }
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    console.log("Video processing stopped by user.");
  };

  const processVideo = async () => {
    if (detectionMode !== 'video' || !uploadedVideoElement || !videoCanvasRef.current) return;
    console.log("Processing video...");
    const canvas = videoCanvasRef.current; // Keep canvas and ctx checks
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Failed to get 2D context from video canvas for processVideo");
      return;
    }

    try {
      await uploadedVideoElement.play();
      setIsProcessingVideo(true);
      isProcessingRef.current = true;
      videoProcessingLoop(); // Directly call the loop for the first frame
    } catch (error) {
      console.error("Error playing video:", error);
      setIsProcessingVideo(false);
      isProcessingRef.current = false;
    }
  };

  const displayUploadedImage = (img: HTMLImageElement) => {
    const canvas = videoCanvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    originalSize.current = [img.naturalWidth, img.naturalHeight];
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
    ctx.drawImage(img, 0, 0, img.width, img.height);
  };

  const runLiveDetection = async () => {
    if (detectionMode === 'image' || detectionMode === 'video') return; // Don't run live detection in image/video mode
    if (liveDetection.current) { // Should be isLiveDetecting to stop
      liveDetection.current = false;
      setIsLiveDetecting(false);
    }
    // Stop video processing if active
    if (isProcessingRef.current) {
      handleStopProcessingVideo();
    }
    liveDetection.current = true;
    setIsLiveDetecting(true);
    while (liveDetection.current) { // This ref is still good for the loop condition
      const startTime = Date.now();
      const ctx = capture();
      if (!ctx) return;
      await runModel(ctx);
      setTotalTime(Date.now() - startTime);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve())
      );
    }
  };

  const processImage = async () => {
    if (detectionMode === 'image') {
      if (!uploadedImageElement) {
        console.log("No image uploaded or loaded yet.");
        return;
      }
      const canvas = videoCanvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      // Ensure canvas is clean and displays the uploaded image before processing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(uploadedImageElement, 0, 0, canvas.width, canvas.height);

      const boxCtx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
      boxCtx.canvas.width = canvas.width;
      boxCtx.canvas.height = canvas.height;
      boxCtx.drawImage(canvas, 0, 0); // Copy the displayed image for processing

      await runModel(boxCtx);
      ctx.drawImage(boxCtx.canvas, 0, 0, canvas.width, canvas.height); // Draw results on original canvas
      return;
    }
    // Original camera capture logic
    reset();
    const ctx = capture();
    if (!ctx) return;

    // create a copy of the canvas
    const boxCtx = document
      .createElement("canvas")
      .getContext("2d") as CanvasRenderingContext2D;
    boxCtx.canvas.width = ctx.canvas.width;
    boxCtx.canvas.height = ctx.canvas.height;
    boxCtx.drawImage(ctx.canvas, 0, 0);

    await runModel(boxCtx);
    ctx.drawImage(boxCtx.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  const reset = async () => {
    var context = videoCanvasRef.current!.getContext("2d")!;
    context.clearRect(0, 0, originalSize.current[0], originalSize.current[1]);
    liveDetection.current = false;
    setUploadedImageSrc(null);
    setUploadedImageElement(null);
    setUploadedVideoSrc(null);
    if (uploadedVideoElement) {
      uploadedVideoElement.pause(); // Stop video playback
    }
    setUploadedVideoElement(null);
    setIsProcessingVideo(false); // Stop video processing loop
    isProcessingRef.current = false;
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    // Clear the canvas if not already cleared by displayUploadedImage or capture
    // This ensures canvas is clear when switching modes or resetting view.
    if (videoCanvasRef.current && originalSize.current[0] > 0 && originalSize.current[1] > 0) {
      var canvasContext = videoCanvasRef.current.getContext("2d")!;
      canvasContext.clearRect(0, 0, originalSize.current[0], originalSize.current[1]);
    }
    setIsLiveDetecting(false);
  };

  const [SSR, setSSR] = useState<Boolean>(true);

  const setWebcamCanvasOverlaySize = () => {
    const element = webcamRef.current!.video!;
    if (!element) return;
    var w = element.offsetWidth;
    var h = element.offsetHeight;
    var cv = videoCanvasRef.current;
    if (!cv) return;
    cv.width = w;
    cv.height = h;
  };

  // close camera when browser tab is minimized
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        liveDetection.current = false;
        setIsLiveDetecting(false);
        reset(); // Reset state when tab is hidden
      }
      // set SSR to true to prevent webcam from loading when tab is not active
      if (detectionMode === 'camera') setSSR(document.hidden);
      else setSSR(false); // Don't hide if in image/video mode
    };
    if (detectionMode === 'camera') {
      setSSR(document.hidden);
    } else {
      setSSR(false); // Don't hide if in image/video mode, ensure canvas is ready
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [detectionMode]);

  if (SSR) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="flex flex-col items-center">
          <LoadingZapIcon className="w-12 h-12 text-primary mb-4 animate-pulse" />
          <p className="text-lg font-semibold text-muted-foreground">Initializing Camera...</p>
        </div>
      </div>
    );
  }

  const handleCapture = async () => {
    const startTime = Date.now();
    await processImage();
    setTotalTime(Date.now() - startTime);
  };

  const handleToggleLiveDetection = () => {
    if (detectionMode === 'image' || detectionMode === 'video') return; // Live detection only in camera mode
    if (isLiveDetecting) {
      liveDetection.current = false; // Signal the loop to stop
      setIsLiveDetecting(false);
    } else {
      runLiveDetection(); // This will set isLiveDetecting to true
    }
  };

  const handleSetDetectionMode = async (mode: 'camera' | 'image' | 'video') => {
    if (detectionMode === mode) return; // Do nothing if already in the target mode
    await reset();
    setDetectionMode(mode);
  };

  const handleFlipCamera = () => {
    if (detectionMode === 'image' || detectionMode === 'video') return;
    reset();
    setFacingMode(facingMode === "user" ? "environment" : "user");
  };

  const handleChangeModel = () => {
    // Assuming props.changeModel exists and is correctly passed
    if(props.changeModel) props.changeModel();
    else if(props.changeModelResolution) props.changeModelResolution(); // fallback for older prop name
  };

  const handleResetView = async () => {
    await reset();
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WebcamDisplay
          webcamRef={webcamRef}
          videoCanvasRef={videoCanvasRef}
          facingMode={facingMode}
          detectionMode={detectionMode}
          uploadedImageSrc={uploadedImageSrc}
          uploadedVideoSrc={uploadedVideoSrc} // Pass video src
          onLoadedMetadata={() => {
            setWebcamCanvasOverlaySize();
            originalSize.current = [
              webcamRef.current!.video!.offsetWidth,
              webcamRef.current!.video!.offsetHeight,
            ] as number[];
          }}
        />

        <Card className="md:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-semibold">
              <Settings2 className="mr-2 h-6 w-6 text-primary" /> Controls & Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActionButtons
              isLiveDetecting={isLiveDetecting}
              onCapture={handleCapture}
              onToggleLiveDetection={handleToggleLiveDetection} // This will be removed in the next chunk if it's the live detection toggle
              onFlipCamera={handleFlipCamera}
              onChangeModel={handleChangeModel}
              onResetView={handleResetView}
              detectionMode={detectionMode}
              onImageUpload={handleImageUpload}
              onSetDetectionMode={handleSetDetectionMode} // Correct prop for mode setting
              onProcessUploadedImage={processImage}
              isImageLoaded={!!uploadedImageElement}
              onVideoUpload={handleVideoUpload}
              onProcessUploadedVideo={processVideo}
              onStopProcessingVideo={handleStopProcessingVideo}
              isVideoLoaded={!!uploadedVideoElement}
              isProcessingVideo={isProcessingVideo}
            />
            <Separator className="my-4" />
            <StatsDisplay
              modelName={props.modelName}
              inferenceTime={inferenceTime}
              totalTime={totalTime}
            />
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Real-time object detection powered by ONNX Runtime.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WebcamComponent;
