'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PestDetection, PlantHealthAnalysis } from '@/lib/types/database-types';
import { Badge } from '@/components/ui/badge';
import DashboardDetectionDisplay from './dashboard-detection-display';

interface DetectionCardProps {
  detection: PestDetection | PlantHealthAnalysis;
  type: 'pest' | 'disease';
}

const DetectionCard = ({ detection, type }: DetectionCardProps) => {
  const title = type === 'pest' ? 'Pest Detected' : 'Disease Detected';

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const timestamp = timeAgo(detection.created_at);

  const renderDetections = () => {
    if (type === 'pest') {
      const pestDetections = (detection as PestDetection).detections;
      return pestDetections && pestDetections.length > 0 ? (
        pestDetections.map((item, index) => (
          <Badge key={index} variant="destructive" className="text-sm">
            {item.label}
          </Badge>
        ))
      ) : (
        <Badge variant="secondary">No detections</Badge>
      );
    } else {
      const healthAnalysis = (detection as PlantHealthAnalysis).result?.result;
      const suggestions = healthAnalysis?.classification?.suggestions;
      return suggestions && suggestions.length > 0 ? (
        suggestions.map((item, index) => (
          <Badge key={index} variant="destructive" className="text-sm">
            {item.name} ({(item.probability * 100).toFixed(1)}%)
          </Badge>
        ))
      ) : (
        <Badge variant="secondary">No detections</Badge>
      );
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden border-2 border-gray-700 bg-gray-900 text-gray-200 shadow-lg shadow-black/50 transition-all hover:shadow-cyan-500/50 hover:border-cyan-500">
      <CardHeader className="flex flex-row items-center justify-between bg-gray-800/50 p-4">
        <CardTitle className="text-lg font-semibold tracking-wider uppercase">{title}</CardTitle>
        <div className="text-xs font-mono text-green-400 animate-pulse">
          ● REC
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {type === 'pest' && detection.image_url ? (
          <DashboardDetectionDisplay imageUrl={detection.image_url} detections={(detection as PestDetection).detections} createdAt={detection.created_at} />
        ) : (
          <>
            {detection.image_url && (
              <div className="relative aspect-video">
                <Image
                  src={detection.image_url}
                  alt={`Detection image for ${detection.id}`}
                  fill={true}
                  style={{objectFit: 'cover'}}
                  className=""
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute top-2 right-2 text-xs font-mono bg-black/50 text-white px-2 py-1 rounded">
                  {new Date(detection.created_at).toLocaleString()}
                </div>
              </div>
            )}
          </>
        )}
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {renderDetections()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-800/50 p-4 mt-auto">
        <p className="text-xs text-muted-foreground">{timestamp}</p>
      </CardFooter>
    </Card>
  );
};

export default DetectionCard;
