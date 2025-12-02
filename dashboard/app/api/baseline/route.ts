import { NextResponse } from 'next/server';
import { ensureBotInitialized } from '@/lib/init-bot';
import { setBaselineBalance, getBaselineBalance } from '@bot/utils/database';
import { getWallet, getBalances } from '@bot/utils/wallet';
import { fetchStake } from '@bot/utils/accounts';
import { getOrbPrice } from '@bot/utils/jupiter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET - Check if baseline exists
 */
export async function GET() {
  try {
    await ensureBotInitialized();
    const baselineBalance = await getBaselineBalance();

    return NextResponse.json({
      hasBaseline: baselineBalance > 0,
      baselineBalance,
    });
  } catch (error) {
    console.error('Error checking baseline:', error);
    return NextResponse.json(
      { error: 'Failed to check baseline', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Set baseline balance for PnL tracking
 */
export async function POST() {
  try {
    await ensureBotInitialized();

    // Check if baseline already exists
    const existing = await getBaselineBalance();
    if (existing > 0) {
      return NextResponse.json(
        { error: 'Baseline already set', baselineBalance: existing },
        { status: 400 }
      );
    }

    // Fetch current balances
    const wallet = getWallet();
    const balances = await getBalances(wallet.publicKey);

    // Fetch staked ORB
    const stake = await fetchStake(wallet.publicKey).catch(() => null);
    const stakedOrb = stake ? Number(stake.balance) / 1e9 : 0;

    // Get ORB price
    const orbPrice = await getOrbPrice().catch(() => ({ priceInSol: 0, priceInUsd: 0 }));

    // Calculate total portfolio value in SOL
    const totalOrb = balances.orb + stakedOrb;
    const orbValueInSol = totalOrb * orbPrice.priceInSol;
    const totalValue = balances.sol + orbValueInSol;

    // Create detailed notes
    const notes = `Initial portfolio: ${balances.sol.toFixed(4)} SOL + ${totalOrb.toFixed(4)} ORB @ ${orbPrice.priceInSol.toFixed(6)} = ${totalValue.toFixed(4)} SOL equivalent`;

    // Set baseline
    await setBaselineBalance(totalValue, notes);

    return NextResponse.json({
      success: true,
      baselineBalance: totalValue,
      breakdown: {
        sol: balances.sol,
        orb: totalOrb,
        orbValueSol: orbValueInSol,
        orbPriceSol: orbPrice.priceInSol,
      },
      notes,
    });
  } catch (error) {
    console.error('Error setting baseline:', error);
    return NextResponse.json(
      { error: 'Failed to set baseline', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
