
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

const AboutDialog = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch('/about.md');
        if (response.ok) {
          const text = await response.text();
          setContent(text);
        } else {
          setContent('# About TokuSFX\n\nTokuSFX is a library of sound effects from Tokusatsu series.');
        }
      } catch (error) {
        console.error('Error loading about content:', error);
        setContent('# About TokuSFX\n\nTokuSFX is a library of sound effects from Tokusatsu series.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutContent();
  }, []);

  // Simple markdown parser (very basic)
  const renderMarkdown = (text: string) => {
    // Replace headers
    let html = text.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-3 mt-6">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2 mt-4">$1</h3>');
    
    // Replace paragraphs
    html = html.replace(/^(?!<h[1-3]|<ul|<ol|<li)(.*$)/gm, '<p class="mb-4">$1</p>');
    
    // Replace links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline" target="_blank">$1</a>');
    
    // Replace lists
    html = html.replace(/^- (.*$)/gm, '<li class="ml-6 list-disc mb-1">$1</li>');
    
    return html;
  };

  return (
    <Dialog>
      <DialogTrigger id="about-dialog" className="hidden">Open About</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>About TokuSFX</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-1/2 mt-8" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            <div 
              className="p-4"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;
