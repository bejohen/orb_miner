'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Rocket,
  Wallet,
  Settings,
  TrendingUp,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';

const WELCOME_STORAGE_KEY = 'orb-miner-welcome-seen';

interface WelcomeStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  tips?: string[];
}

const steps: WelcomeStep[] = [
  {
    title: 'Welcome to ORB Miner! 🚀',
    description: 'Your autonomous Solana mining bot with Monte Carlo-optimized strategies. Let\'s take a quick tour to get you started.',
    icon: <Rocket className="h-12 w-12 text-primary" />,
    tips: [
      'Takes only 2 minutes to complete',
      'Learn key concepts and features',
      'Get tips for maximizing profits',
    ],
  },
  {
    title: 'Understanding the Dashboard',
    description: 'Your main dashboard shows real-time mining stats, profitability, and current round information.',
    icon: <TrendingUp className="h-12 w-12 text-green-500" />,
    tips: [
      'Net Profit: Your total earnings (SOL)',
      'ROI: Return on investment percentage',
      'Motherload: Prize pool for winners',
      'Mining Status: Active or waiting',
    ],
  },
  {
    title: 'How ORB Mining Works',
    description: 'ORB is a lottery-style game. The bot deploys to all 25 squares each round. Winners share SOL from losers + 4 ORB + motherload bonus.',
    icon: <Zap className="h-12 w-12 text-yellow-500" />,
    tips: [
      'Bot deploys to all 25 squares automatically',
      'Expected value (EV) calculated before each round',
      'Only mines when profitable (EV > 0)',
      'Wins ~4% of rounds (1 in 25 chance)',
    ],
  },
  {
    title: 'Key Metrics to Watch',
    description: 'These metrics help you understand profitability and make informed decisions.',
    icon: <TrendingUp className="h-12 w-12 text-blue-500" />,
    tips: [
      'Motherload: Higher = more profitable',
      'Competition: Lower = better odds',
      'Mining Premium: Negative = good (cheaper to mine than buy)',
      'Expected Value (EV): Must be > 0 to mine',
    ],
  },
  {
    title: 'Settings & Strategy',
    description: 'Customize your mining strategy, thresholds, and automation settings in the Settings page.',
    icon: <Settings className="h-12 w-12 text-purple-500" />,
    tips: [
      '7 deployment strategies (Ultra Conservative → Aggressive)',
      'Auto-claim rewards when thresholds met',
      'Auto-swap ORB to SOL for compounding',
      'Price-based staking for advanced users',
    ],
  },
  {
    title: 'Ready to Start Mining!',
    description: 'You\'re all set! The bot will start mining automatically when conditions are profitable.',
    icon: <CheckCircle className="h-12 w-12 text-green-500" />,
    tips: [
      'Check Settings to enable mining if paused',
      'Monitor Profitability page for EV calculations',
      'View Transactions page for all activity',
      'Join community for tips and support',
    ],
  },
];

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome modal
    const hasSeenWelcome = localStorage.getItem(WELCOME_STORAGE_KEY);
    if (!hasSeenWelcome) {
      // Delay opening slightly for better UX
      setTimeout(() => setOpen(true), 500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
    }
    setOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
    setOpen(false);
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl border-border/50">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl flex items-center gap-3">
              {currentStepData.icon}
              {currentStepData.title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tips List */}
          {currentStepData.tips && (
            <div className="space-y-2">
              {currentStepData.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg bg-accent/50"
                >
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step Counter */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            {isLastStep && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded"
                />
                <span>Don't show again</span>
              </label>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {!isLastStep && (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip Tutorial
                </Button>
              )}
              {isLastStep ? (
                <Button onClick={handleFinish}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
