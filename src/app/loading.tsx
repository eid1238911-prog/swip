'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
