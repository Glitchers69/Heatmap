import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LocationButtonProps {
  className?: string;
}

const LocationButton: React.FC<LocationButtonProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLocationCenter = async () => {
    setIsLoading(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        });
      });

      // Call global center function if available
      if ((window as any).centerToLocation) {
        (window as any).centerToLocation();
      }

      toast({
        title: "Location found",
        description: "Map centered to your current location",
      });
      
    } catch (error) {
      console.error('Error getting location:', error);
      
      // Fallback to default location (Times Square)
      if ((window as any).centerToLocation) {
        (window as any).centerToLocation();
      }
      
      toast({
        title: "Location unavailable",
        description: "Centered to default location instead",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
        <Button
          onClick={handleLocationCenter}
          disabled={isLoading}
          variant="floating"
          size="lg"
          className="w-14 h-14 rounded-full"
        >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
        ) : (
          <Navigation className="h-6 w-6 text-primary-foreground" />
        )}
      </Button>
    </motion.div>
  );
};

export default LocationButton;