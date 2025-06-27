// apps/web/components/ui/AnimatedSection.tsx
'use client';

import { motion } from 'framer-motion';

export const AnimatedSection = ({ children }: { children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-20%' }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.section>
);