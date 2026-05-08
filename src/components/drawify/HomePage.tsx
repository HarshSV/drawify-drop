'use client';

import Header from '@/components/drawify/Header';
import TextToDrawing from '@/components/drawify/TextToDrawing';
import ImproveDrawing from '@/components/drawify/ImproveDrawing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-start gap-8 p-4 md:p-8">
        <div className="w-full max-w-5xl">
          <Tabs defaultValue="text-to-drawing" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="text-to-drawing" className="text-base">Text to Drawing</TabsTrigger>
              <TabsTrigger value="improve-drawing" className="text-base">Improve My Drawing</TabsTrigger>
            </TabsList>
            <TabsContent value="text-to-drawing" className="mt-6">
              <TextToDrawing />
            </TabsContent>
            <TabsContent value="improve-drawing" className="mt-6">
              <ImproveDrawing />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
