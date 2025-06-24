import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon: React.ReactNode;
}

export default function EmptyState({ title, description, buttonText, buttonLink, icon }: EmptyStateProps) {
  return (
    <Card className="w-full py-12">
      <CardContent className="flex flex-col items-center justify-center text-center gap-4">
        <div className="bg-primary/10 p-3 rounded-full">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        <Button asChild>
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
