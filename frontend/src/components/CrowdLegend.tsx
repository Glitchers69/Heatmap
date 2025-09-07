import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const densityLevels = [
  { label: 'Low', color: 'bg-density-low', intensity: '0-30%' },
  { label: 'Medium', color: 'bg-density-medium', intensity: '30-60%' },
  { label: 'High', color: 'bg-density-high', intensity: '60-80%' },
  { label: 'Extreme', color: 'bg-density-extreme', intensity: '80-100%' },
];

interface CrowdLegendProps {
  className?: string;
}

const CrowdLegend: React.FC<CrowdLegendProps> = ({ className = '' }) => {
  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-lg">
        <CardContent className="p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Crowd Density
            </h3>
            
            {densityLevels.map((level, index) => (
              <motion.div
                key={level.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.3 + (index * 0.1) }}
                className="flex items-center gap-3"
              >
                {level.label === 'Extreme' ? (
                  <motion.div 
                    className={`w-4 h-4 rounded-full ${level.color}`}
                    animate={{
                      boxShadow: [
                        '0 0 5px 2px rgba(239, 68, 68, 0.7)',
                        '0 0 15px 5px rgba(239, 68, 68, 0.9)',
                        '0 0 5px 2px rgba(239, 68, 68, 0.7)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ) : (
                  <div className={`w-4 h-4 rounded-full ${level.color}`} />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {level.label}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs px-2 py-0.5 bg-secondary/60"
                    >
                      {level.intensity}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="pt-2 mt-3 border-t border-border/30"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  Live updates every 3s
                </span>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CrowdLegend;