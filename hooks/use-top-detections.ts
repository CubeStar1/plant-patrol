import { createSupabaseBrowser } from '@/lib/supabase/client';

interface TopDetections {
  pests: string;
}

export async function fetchTopDetections(userId: string): Promise<TopDetections> {
  const supabase = createSupabaseBrowser();
  
  // Query pest_detections table for pests
  const { data: pestData } = await supabase
    .from('pest_detections')
    .select('detections, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)
    .then();

  // Format pest detections with timestamps
  const formattedPests = pestData?.map((detection, index) => {
    const date = new Date(detection.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return `Detection ${index + 1} (${date}):\n${JSON.stringify(detection.detections, null, 2)}`;
  }).join('\n\n') || 'No recent pest detections';

  // Expert prompt about agricultural pests
  const expertPrompt = `
You are an expert in agricultural pest management and control. You have extensive knowledge about:
- Common agricultural pests and their life cycles
- Pest identification methods
- Integrated Pest Management (IPM) practices
- Organic and chemical pest control methods
- Pest-resistant crop varieties
- Seasonal pest patterns and prevention
- Impact of environmental factors on pest populations
- Natural predators and biological control methods

When discussing pests, provide:
- Detailed information about pest characteristics and behavior
- Prevention and control strategies
- Organic alternatives where possible
- Impact on crop yield and quality
- Monitoring and early detection methods

Use your expertise to help users understand and manage agricultural pests effectively.`;

  return {
    pests: `${expertPrompt}\n\n${formattedPests}`
  };
}
