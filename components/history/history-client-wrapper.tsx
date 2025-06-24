"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, List, Leaf, Bug } from 'lucide-react';
import EmptyState from './empty-state';
import PlantHealthDetails from './plant-health-details';
import PestDetectionDetails from './pest-detection-details';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  created_at: string;
  image_url: string;
  result?: any; // For plant health
  detections?: any; // For pest detection
}

interface HistoryClientWrapperProps {
  healthData: HistoryItem[];
  pestData: HistoryItem[];
}

const HistoryCard = ({ item }: { item: HistoryItem }) => {
  const isPlantHealth = !!item.result;
  const analysisType = isPlantHealth ? 'Plant Health' : 'Pest Detection';
  const analysisIcon = isPlantHealth ? <Leaf className="h-4 w-4 mr-2" /> : <Bug className="h-4 w-4 mr-2" />;

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0">
        <img src={item.image_url} alt="Submission" className="w-full h-48 object-cover rounded-t-lg" />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <Badge variant={isPlantHealth ? 'default' : 'secondary'} className="mb-2">
          {analysisIcon}
          {analysisType}
        </Badge>
        <p className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">View Details</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                <Link href={`/plant-health/${item.id}`}>
                  <Button variant="outline">{analysisType} Details</Button>
                </Link>
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-auto p-1">
              {isPlantHealth ? (
                <PlantHealthDetails result={item.result} />
              ) : (
                <PestDetectionDetails imageUrl={item.image_url} detections={item.detections} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

const HistoryRow = ({ item }: { item: HistoryItem }) => {
  const isPlantHealth = !!item.result;
  const analysisType = isPlantHealth ? 'Plant Health' : 'Pest Detection';
  const analysisIcon = isPlantHealth ? <Leaf className="h-4 w-4 mr-2" /> : <Bug className="h-4 w-4 mr-2" />;

  return (
    <TableRow>
      <TableCell>
        <img src={item.image_url} alt="Submission" className="w-24 h-24 object-cover rounded-md" />
      </TableCell>
      <TableCell className="text-muted-foreground">{new Date(item.created_at).toLocaleString()}</TableCell>
      <TableCell>
        <Badge variant={isPlantHealth ? 'default' : 'secondary'} className="mb-2">
          {analysisIcon}
          {analysisType}
        </Badge>
      </TableCell>
            <TableCell>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">View Details</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              
            </DialogHeader>
            <div className="max-h-[80vh] overflow-auto p-1">
              {isPlantHealth ? (
                <PlantHealthDetails result={item.result} />
              ) : (
                <PestDetectionDetails imageUrl={item.image_url} detections={item.detections} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
};

export default function HistoryClientWrapper({ healthData, pestData }: HistoryClientWrapperProps) {
  const [view, setView] = useState<'card' | 'table'>('card');

    const allData = [...healthData, ...pestData].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const renderContent = (data: HistoryItem[], type: 'plant-health' | 'pest-detection' | 'all') => {
    if (data.length === 0) {
      const props = {
        'plant-health': {
          title: 'No Plant Health Analyses',
          description: 'You have not performed any plant health analyses yet.',
          buttonText: 'Analyze a Plant',
          buttonLink: '/plant-health',
          icon: <Leaf className="h-8 w-8 text-primary" />,
        },
        'pest-detection': {
          title: 'No Pest Detections',
          description: 'You have not performed any pest detections yet.',
          buttonText: 'Detect Pests',
          buttonLink: '/advanced-detection',
          icon: <Bug className="h-8 w-8 text-primary" />,
        },
        'all': {
          title: 'No Submission History',
          description: 'Get started by analyzing a plant or detecting pests.',
          buttonText: 'Go to Dashboard',
          buttonLink: '/dashboard',
          icon: <Leaf className="h-8 w-8 text-primary" />,
        },
      };
      return <EmptyState {...props[type]} />;
    }

    return view === 'card' ? (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.map(item => <HistoryCard key={item.id} item={item} />)}
      </div>
    ) : (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(item => <HistoryRow key={item.id} item={item} />)}
          </TableBody>
        </Table>
      </Card>
    );
  };

  return (
    <Tabs defaultValue="all">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="plant-health">Plant Health</TabsTrigger>
          <TabsTrigger value="pest-detection">Pest Detection</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button variant={view === 'card' ? 'default' : 'outline'} size="icon" onClick={() => setView('card')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={view === 'table' ? 'default' : 'outline'} size="icon" onClick={() => setView('table')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

            <TabsContent value="all">
        {renderContent(allData, 'all')}
      </TabsContent>

            <TabsContent value="plant-health">
        {renderContent(healthData, 'plant-health')}
      </TabsContent>

            <TabsContent value="pest-detection">
        {renderContent(pestData, 'pest-detection')}
      </TabsContent>
    </Tabs>
  );
}
