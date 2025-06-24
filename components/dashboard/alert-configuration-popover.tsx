"use client";

import { useState, useEffect } from 'react';
import useUser from '@/hooks/use-user';
import { createSupabaseBrowser } from '@/lib/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BellIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AlertConfigurationPopover() {
  const { data: user } = useUser();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSendAlert = async () => {
    if (!email || !user) {
      toast.error('Email is missing or user is not logged in.');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch latest data
      const { data: pestData, error: pestError } = await supabase
        .from('pest_detections')
        .select('image_url, detections')
        .eq('user_id', user.id);

      const { data: healthData, error: healthError } = await supabase
        .from('plant_health_analyses')
        .select('image_url, result')
        .eq('user_id', user.id);

      if (pestError || healthError) {
        throw new Error('Failed to fetch detection data.');
      }

      // Group detections by image URL to avoid duplicates
      const groupDetections = (data: any[], type: 'pest' | 'disease') => {
        const grouped = data?.reduce((acc, item) => {
          const imageUrl = item.image_url;
          if (!imageUrl) return acc;

          let names: string[] = [];
          if (type === 'pest') {
            names = (item.detections as { label: string }[] || []).map(d => d.label);
          } else {
            names = (item.result?.result?.classification?.suggestions as { name: string }[] || []).map(s => s.name);
          }

          if (names.length === 0) return acc;

          const existing = acc.get(imageUrl);
          if (existing) {
            existing.names.push(...names);
            // Remove duplicates
            existing.names = [...new Set(existing.names)];
          } else {
            acc.set(imageUrl, { imageUrl, names: [...new Set(names)] });
          }
          return acc;
        }, new Map<string, { imageUrl: string; names: string[] }>());

        return Array.from(grouped?.values() || []);
      };

      const pestDetections = groupDetections(pestData, 'pest');
      const diseaseDetections = groupDetections(healthData, 'disease');

      const response = await fetch('/api/send-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, pestDetections, diseaseDetections }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Test alert sent successfully!');
      } else {
        toast.error(`Failed to send alert: ${result.error}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <BellIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Configure Alerts</h4>
            <p className="text-sm text-muted-foreground">
              Enter your email to receive detection alerts.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-2 h-8"
              />
            </div>
          </div>
          <Button onClick={handleSendAlert} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Test Alert'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
