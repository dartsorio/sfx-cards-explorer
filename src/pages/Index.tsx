
import { useAppContext } from '@/lib/app-context';
import Layout from '@/components/Layout';
import SoundCard from '@/components/SoundCard';
import SearchAndFilters from '@/components/SearchAndFilters';
import AboutDialog from '@/components/AboutDialog';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { loading, error, filteredSounds } = useAppContext();

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
          <h1 className="text-3xl font-bold mb-4 text-destructive">Error Loading Data</h1>
          <p className="text-lg mb-8">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AboutDialog />
      
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Tokusatsu Sound Effects Library</h1>
        
        <SearchAndFilters />
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[200px] w-full rounded-md" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSounds.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">No sounds found</h2>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSounds.map((sound) => (
              <SoundCard key={sound.id} sound={sound} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
