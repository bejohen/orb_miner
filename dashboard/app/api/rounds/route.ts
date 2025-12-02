import { NextRequest, NextResponse } from 'next/server';
import { ensureBotInitialized } from '@/lib/init-bot';
import { allQuery } from '@bot/utils/database';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await ensureBotInitialized();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Get rounds with enriched data from transactions
    const rounds = await allQuery<any>(`
      SELECT
        r.round_id as roundId,
        r.timestamp,
        r.motherload,
        r.deployed_amount as deployed,
        r.squares_deployed as squaresDeployed,
        r.automation_balance_before as balanceBefore,
        r.automation_balance_after as balanceAfter,
        -- Get winnings (SOL + ORB from claims for this round)
        COALESCE(
          (SELECT SUM(sol_amount) FROM transactions
           WHERE round_id = r.round_id AND type = 'claim_sol' AND status = 'success'),
          0
        ) as winnings,
        -- Get ORB claimed (vaulted)
        COALESCE(
          (SELECT SUM(orb_amount) FROM transactions
           WHERE round_id = r.round_id AND type = 'claim_orb' AND status = 'success'),
          0
        ) as vaulted,
        -- Count total winners (if we have claim records)
        (SELECT COUNT(DISTINCT signature) FROM transactions
         WHERE round_id = r.round_id AND type IN ('claim_sol', 'claim_orb') AND status = 'success'
        ) as winnersCount
      FROM rounds r
      ORDER BY r.round_id DESC
      LIMIT ?
    `, [limit]);

    // Format the data for UI
    const formattedRounds = rounds.map((round: any) => ({
      roundId: round.roundId,
      timestamp: round.timestamp,
      motherload: round.motherload,
      deployed: round.deployed || 0,
      vaulted: round.vaulted || 0,
      winnings: round.winnings || 0,
      winnersCount: round.winnersCount || 0,
      squaresDeployed: round.squaresDeployed || 0,
      balanceBefore: round.balanceBefore || 0,
      balanceAfter: round.balanceAfter || 0,
      // winningBlock and orbWinner would need blockchain data
      // For now, leave as undefined (UI shows "?" and "-")
      winningBlock: undefined,
      orbWinner: undefined,
    }));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      count: formattedRounds.length,
      rounds: formattedRounds,
    });
  } catch (error) {
    console.error('Error fetching rounds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rounds', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
