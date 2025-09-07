import React from 'react';
import { motion } from 'framer-motion';
import Map from '@/components/Map';
import SearchBar from '@/components/SearchBar';
import CrowdLegend from '@/components/CrowdLegend';
import LocationButton from '@/components/LocationButton';

const Index = () => {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Map Background */}
      <Map onLocationSearch={handleSearch} />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Search Bar - Top Center */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
          <SearchBar 
            onSearch={handleSearch}
            className="w-96 max-w-[90vw]"
          />
        </div>

        {/* Crowd Legend - Bottom Left */}
        <div className="absolute bottom-6 left-6 z-40 pointer-events-auto">
          <CrowdLegend />
        </div>

        {/* Location Button - Bottom Right */}
        <div className="absolute bottom-6 right-6 z-40 pointer-events-auto">
          <LocationButton />
        </div>

        {/* App Title - Top Left */}
        <motion.div
          className="absolute top-6 left-6 z-30 pointer-events-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-card/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-border/50">
            <h1 className="text-lg font-bold text-primary">CrowdFlow</h1>
            <p className="text-xs text-muted-foreground">Live Crowd Density</p>
          </div>
        </motion.div>

        {/* Status Indicator - Top Right */}
        <motion.div
          className="absolute top-6 right-6 z-30 lg:right-24"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="bg-card/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-border/50 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-foreground">Live</span>
          </div>
        </motion.div>
      </div>

      {/* Loading State Overlay */}
      <motion.div
        className="absolute inset-0 bg-background flex items-center justify-center z-50"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ pointerEvents: 'none' }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading crowd data...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;