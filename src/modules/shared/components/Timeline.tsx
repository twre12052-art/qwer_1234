import React from 'react';

interface TimelineStep {
  label: string;
  completed: boolean;
  active: boolean;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {/* Step Circle */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  step.completed
                    ? 'bg-blue-600 border-blue-600 shadow-sm'
                    : step.active
                    ? 'bg-blue-600 border-blue-600 shadow-sm animate-pulse'
                    : 'bg-white border-gray-300'
                }`}
              >
                {step.completed ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : step.active ? (
                  <div className="w-3 h-3 bg-white rounded-full" />
                ) : (
                  <div className="w-3 h-3 bg-gray-300 rounded-full" />
                )}
              </div>
              <span
                className={`mt-3 text-sm font-medium text-center ${
                  step.completed || step.active 
                    ? 'text-gray-900 font-semibold' 
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>

          {/* Connector Line (except after last step) */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-3 -mt-6">
              <div
                className={`h-full transition-colors ${
                  steps[index + 1].completed || steps[index + 1].active
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

