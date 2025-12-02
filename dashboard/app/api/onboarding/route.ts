import { NextRequest, NextResponse } from 'next/server';
import {
  getOnboardingState,
  initOnboardingState,
  updateOnboardingState,
  resetOnboardingState,
  OnboardingState,
} from '@bot/utils/database';
import { ensureBotInitialized } from '@/lib/init-bot';

/**
 * GET /api/onboarding
 * Get current onboarding state
 */
export async function GET(request: NextRequest) {
  try {
    await ensureBotInitialized();
    const userId = 'default'; // Single user system

    // Try to get existing state
    let state = await getOnboardingState(userId);

    // If no state exists, initialize it
    if (!state) {
      await initOnboardingState(userId);
      state = await getOnboardingState(userId);
    }

    return NextResponse.json({ state }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to get onboarding state:', error);
    return NextResponse.json(
      { error: 'Failed to get onboarding state', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/onboarding
 * Update onboarding state
 */
export async function PATCH(request: NextRequest) {
  try {
    await ensureBotInitialized();
    const userId = 'default';
    const body = await request.json();

    // Validate input
    const updates: Partial<OnboardingState> = {};

    if (body.current_step !== undefined) {
      if (typeof body.current_step !== 'number' || body.current_step < 1 || body.current_step > 3) {
        return NextResponse.json(
          { error: 'Invalid current_step. Must be 1, 2, or 3' },
          { status: 400 }
        );
      }
      updates.current_step = body.current_step;
    }

    if (body.completed !== undefined) {
      updates.completed = Boolean(body.completed);
    }

    if (body.wallet_funded !== undefined) {
      updates.wallet_funded = Boolean(body.wallet_funded);
    }

    if (body.strategy_selected !== undefined) {
      updates.strategy_selected = body.strategy_selected;
    }

    if (body.mining_enabled !== undefined) {
      updates.mining_enabled = Boolean(body.mining_enabled);
    }

    if (body.skipped !== undefined) {
      updates.skipped = Boolean(body.skipped);
    }

    // Ensure state exists
    let state = await getOnboardingState(userId);
    if (!state) {
      await initOnboardingState(userId);
    }

    // Update state
    await updateOnboardingState(userId, updates);

    // Return updated state
    state = await getOnboardingState(userId);

    return NextResponse.json({ state }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to update onboarding state:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding state', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/onboarding
 * Reset onboarding state (for testing)
 */
export async function DELETE(request: NextRequest) {
  try {
    await ensureBotInitialized();
    const userId = 'default';
    await resetOnboardingState(userId);

    return NextResponse.json({ success: true, message: 'Onboarding state reset' }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to reset onboarding state:', error);
    return NextResponse.json(
      { error: 'Failed to reset onboarding state', details: error.message },
      { status: 500 }
    );
  }
}
