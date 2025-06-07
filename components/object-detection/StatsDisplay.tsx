import React from 'react';

interface StatsDisplayProps {
  modelName: string;
  inferenceTime: number;
  totalTime: number;
}

const StatCard: React.FC<{ title: string; value: string; gradient: string }> = ({ title, value, gradient }) => (
  <div className={`p-3 rounded-lg shadow text-white ${gradient}`}>
    <p className="font-semibold text-xs">{title}</p>
    <p className="text-lg">{value}</p>
  </div>
);

const StatsDisplay: React.FC<StatsDisplayProps> = ({ modelName, inferenceTime, totalTime }) => {
  const modelFps = (1000 / (inferenceTime || 1)).toFixed(1);
  const totalFps = (1000 / (totalTime || 1)).toFixed(1);
  const overheadTime = Math.abs(totalTime - inferenceTime).toFixed(2);
  const overheadFps = (1000 / (Math.abs(totalTime - inferenceTime) || 1)).toFixed(1);

  return (
    <div>
      <h3 className="text-md font-semibold mb-3 text-muted-foreground">Performance Metrics</h3>
      <div className="p-3 rounded-lg shadow bg-gradient-to-br from-gray-700 to-gray-800 text-white mb-3">
        <p className="font-semibold text-sm text-center">Using Model:</p>
        <p className="text-lg truncate text-center font-medium">{modelName}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Inference Time" value={`${inferenceTime.toFixed(2)} ms`} gradient="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" />
        <StatCard title="Model FPS" value={modelFps} gradient="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" />
        <StatCard title="Total Time" value={`${totalTime.toFixed(2)} ms`} gradient="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" />
        <StatCard title="Total FPS" value={totalFps} gradient="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" />
        <StatCard title="Overhead Time" value={`${overheadTime} ms`} gradient="bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700" />
        <StatCard title="Overhead FPS" value={overheadFps} gradient="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700" />
      </div>
    </div>
  );
};

export default StatsDisplay;
