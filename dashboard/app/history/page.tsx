'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { History, TrendingUp, Users, Award, ExternalLink } from 'lucide-react';
import Link from 'next/link';

async function fetchRounds() {
  const res = await fetch('/api/rounds');
  if (!res.ok) throw new Error('Failed to fetch rounds');
  return res.json();
}

export default function MiningHistoryPage() {
  const { data: rounds, isLoading } = useQuery({
    queryKey: ['rounds'],
    queryFn: fetchRounds,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <History className="h-12 w-12 animate-pulse text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const roundsList = rounds?.rounds || [];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              Mining History
              <Badge variant="outline" className="ml-auto">
                {roundsList.length} Rounds
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Rounds Table */}
        <Card className="border-primary/30">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="font-semibold">Round</TableHead>
                    <TableHead className="font-semibold">Block</TableHead>
                    <TableHead className="font-semibold">ORB Winner</TableHead>
                    <TableHead className="font-semibold text-center">Winners</TableHead>
                    <TableHead className="font-semibold text-right">Deployed</TableHead>
                    <TableHead className="font-semibold text-right">Vaulted</TableHead>
                    <TableHead className="font-semibold text-right">Winnings</TableHead>
                    <TableHead className="font-semibold text-right">Motherlode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roundsList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No mining history yet. Start mining to see your rounds here.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roundsList.map((round: any) => (
                      <TableRow
                        key={round.roundId}
                        className="hover:bg-accent/50 transition-colors"
                      >
                        {/* Round Number */}
                        <TableCell className="font-mono">
                          <Link
                            href={`https://solscan.io`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            #{round.roundId}
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </TableCell>

                        {/* Block/Square */}
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            #{round.winningBlock || '?'}
                          </Badge>
                        </TableCell>

                        {/* ORB Winner */}
                        <TableCell>
                          {round.orbWinner ? (
                            round.orbWinner === 'Split' ? (
                              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                                Split
                              </Badge>
                            ) : (
                              <span className="font-mono text-xs">
                                {round.orbWinner.slice(0, 4)}...{round.orbWinner.slice(-4)}
                              </span>
                            )
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        {/* Winners Count */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold">{round.winnersCount || 0}</span>
                          </div>
                        </TableCell>

                        {/* Deployed */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <TrendingUp className="h-3 w-3 text-blue-400" />
                            <span className="font-mono text-blue-400">
                              {parseFloat(round.deployed || 0).toFixed(8)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Vaulted */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Award className="h-3 w-3 text-purple-400" />
                            <span className="font-mono text-purple-400">
                              {parseFloat(round.vaulted || 0).toFixed(8)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Winnings */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-mono text-green-400">
                              {parseFloat(round.winnings || 0).toFixed(8)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Motherlode */}
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className="font-mono bg-primary/20 text-primary border-primary/50"
                          >
                            {round.motherlode ? round.motherlode.toFixed(2) : '-'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        {roundsList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rounds</p>
                    <p className="text-2xl font-bold text-primary">
                      {roundsList.length}
                    </p>
                  </div>
                  <History className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Deployed</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {roundsList
                        .reduce((sum: number, r: any) => sum + parseFloat(r.deployed || 0), 0)
                        .toFixed(4)} SOL
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-400/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Winnings</p>
                    <p className="text-2xl font-bold text-green-400">
                      {roundsList
                        .reduce((sum: number, r: any) => sum + parseFloat(r.winnings || 0), 0)
                        .toFixed(4)} SOL
                    </p>
                  </div>
                  <Award className="h-8 w-8 text-green-400/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Motherlode</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {(
                        roundsList.reduce((sum: number, r: any) => sum + (r.motherlode || 0), 0) /
                        roundsList.length
                      ).toFixed(2)} ORB
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-400/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
