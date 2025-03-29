
import { useState } from 'react';
import { useAppContext } from '@/lib/app-context';
import { saveFormData } from '@/lib/data-utils';
import Layout from '@/components/Layout';
import { SoundFormData } from '@/types/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Upload, Check } from 'lucide-react';
import { extractTags } from '@/lib/data-utils';

const SubmitForm = () => {
  const { data } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<SoundFormData>({
    title: '',
    category: '',
    season: '',
    tags: [],
    description: '',
    source: '',
    wikiLink: '',
  });

  if (!data) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  const allTags = extractTags(data.sounds)
    .map(tag => tag.name)
    .sort((a, b) => a.localeCompare(b));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Reset season if category changes
    if (name === 'category') {
      setFormData(prev => ({ ...prev, season: '' }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if the file is an audio file
      if (!file.type.startsWith('audio/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an audio file',
          variant: 'destructive',
        });
        return;
      }
      setUploadedAudio(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file',
          variant: 'destructive',
        });
        return;
      }
      setUploadedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.category || !formData.season || !uploadedAudio) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in all required fields and upload an audio file',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a timestamp ID for the submission
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const uniqueId = `${formData.title.toLowerCase().replace(/\s+/g, '_')}_${timestamp}`;
      
      // Prepare form data for submission
      const submissionData = {
        id: uniqueId,
        title: formData.title,
        category: formData.category,
        season: formData.season,
        tags: selectedTags,
        description: formData.description || '',
        source: formData.source || '',
        wikiLink: formData.wikiLink || '',
        audioFileName: uploadedAudio?.name || '',
        imageFileName: uploadedImage?.name || '',
        submittedAt: new Date().toISOString(),
      };

      // In a real application, we would upload the files to a server here
      // For now, we'll just simulate a successful submission
      
      const result = await saveFormData(submissionData);
      
      if (result.success) {
        toast({
          title: 'Submission Successful',
          description: `Your sound has been submitted as ${result.fileName}`,
        });
        setIsSuccess(true);
        
        // Reset form
        setTimeout(() => {
          setFormData({
            title: '',
            category: '',
            season: '',
            tags: [],
            description: '',
            source: '',
            wikiLink: '',
          });
          setSelectedTags([]);
          setUploadedAudio(null);
          setUploadedImage(null);
          setIsSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to save form data');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your sound. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available seasons based on selected category
  const availableSeasons = data.categories
    .find(cat => cat.name === formData.category)
    ?.seasons.map(season => season.name) || [];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Submit a Sound Effect</h1>
        
        <p className="text-muted-foreground mb-8">
          Have a sound effect you'd like to share? Fill out the form below to submit it for review.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Sound Effect Submission</CardTitle>
            <CardDescription>
              All fields marked with an asterisk (*) are required.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter sound effect title"
                  required
                />
              </div>
              
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Season */}
              <div className="space-y-2">
                <Label htmlFor="season">
                  Season <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.season}
                  onValueChange={(value) => handleSelectChange('season', value)}
                  disabled={!formData.category}
                >
                  <SelectTrigger id="season">
                    <SelectValue placeholder={formData.category ? "Select a season" : "Select a category first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSeasons.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTagToggle(tag)}
                      className="text-xs h-7"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Audio File Upload */}
              <div className="space-y-2">
                <Label htmlFor="audio-upload">
                  Upload Sound File <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('audio-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadedAudio ? uploadedAudio.name : 'Choose audio file'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: MP3, WAV, OGG (max 10MB)
                </p>
              </div>
              
              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label htmlFor="image-upload">Upload Thumbnail Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadedImage ? uploadedImage.name : 'Choose image file'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, GIF (max 5MB)
                </p>
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter a description for the sound effect"
                  rows={3}
                />
              </div>
              
              {/* Source */}
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  placeholder="Where is this sound from? (episode, movie, etc.)"
                />
              </div>
              
              {/* Wiki Link */}
              <div className="space-y-2">
                <Label htmlFor="wikiLink">Wiki Link</Label>
                <Input
                  id="wikiLink"
                  name="wikiLink"
                  value={formData.wikiLink}
                  onChange={handleInputChange}
                  placeholder="Link to relevant wiki page (if available)"
                  type="url"
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submitted!
                  </>
                ) : (
                  'Submit Sound Effect'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default SubmitForm;
