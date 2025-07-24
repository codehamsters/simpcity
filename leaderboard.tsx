"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Medal, Award } from "lucide-react";

// Level calculation function
function calculateLevel(xp: number) {
  let level = 1;
  let requiredXP = 100;
  let totalXP = 0;

  while (xp >= totalXP + requiredXP) {
    totalXP += requiredXP;
    level++;
    requiredXP = Math.floor(requiredXP * 1.5); // Each level requires 50% more XP
  }

  const currentLevelXP = xp - totalXP;
  const nextLevelXP = requiredXP;
  const progress = (currentLevelXP / nextLevelXP) * 100;

  return { level, currentLevelXP, nextLevelXP, progress };
}

function getRankIcon(position: number) {
  switch (position) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Trophy className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <Award className="w-5 h-5 text-[#ff6600]" />;
  }
}

export default function Component() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard");
        if (!response.ok) throw new Error("Failed to fetch leaderboard data");
        const data = await response.json();
        // If your API returns lastUpdated as a property, use it. Otherwise, get it from the first item.
        let updatedAt = null;
        if (Array.isArray(data) && data.length > 0) {
          // If your leaderboard documents have a lastUpdated/updatedAt field, use it
          updatedAt = data[0].updatedAt || data[0].lastUpdated || null;
        }
        setLeaderboardData(data);
        setLastUpdated(updatedAt);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const sortedData = leaderboardData.slice().sort((a, b) => b.count - a.count);

  // Format last updated date
  let lastUpdatedDisplay = "";
  if (lastUpdated) {
    try {
      const date = new Date(lastUpdated);
      lastUpdatedDisplay = date.toLocaleString();
    } catch {
      lastUpdatedDisplay = lastUpdated;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Cyber background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,102,0,0.1),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block rounded-full mb-4">
            <img
              src="/simpcity_logo.jpg?height=80&width=200"
              alt="SimpCity Logo"
              className="h-20 rounded-full w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold bg-[#ff6600] bg-clip-text text-transparent">
            SimpCity
          </h1>
        </div>

        {/* Promo to join SimpCity */}
        <div className="mb-6 flex justify-center">
          <div className="bg-[#ff6600] rounded-xl px-6 py-4 shadow-lg flex items-center gap-4">
            <span className="text-white text-lg font-semibold">
              Want to see your name here?
            </span>
            <a
              href="https://ig.me/j/Aba9tGznTZrZ7RY8"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white font-bold px-4 py-2 rounded-lg border-2 border-white hover:bg-[#ff4da6] hover:text-black transition"
            >
              Join SimpCity
            </a>
          </div>
        </div>

        {/* Leaderboard Title */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white mb-2">Top Simps</h2>
          <div className="w-24 h-1 bg-[#ff6600] mx-auto rounded-full" />
        </div>

        {/* Not realtime note */}
        <div className="text-center mb-8">
          <span className="text-sm text-gray-400">
            Leaderboard is updated once per day. Results are not realtime.
            {lastUpdatedDisplay && (
              <>
                <br />
                <span className="text-xs text-gray-500">
                  Last updated: {lastUpdatedDisplay}
                </span>
              </>
            )}
          </span>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4 mb-32">
          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : (
            sortedData.map((user, index) => {
              const { level, currentLevelXP, nextLevelXP, progress } =
                calculateLevel(user.count);

              return (
                user.username != "unknown" && (
                  <Card
                    key={user.userId}
                    className="bg-gray-900/80 border-gray-700 hover:border-[#ff6600] transition-all duration-300 hover:shadow-lg hover:shadow-[#ff6600]/20 backdrop-blur-sm"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        {/* Mobile: Top row with rank, profile, and basic info */}
                        <div className="flex items-center gap-3 sm:gap-4">
                          {/* Rank */}
                          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 flex-shrink-0">
                            <span className="text-lg sm:text-xl font-bold text-white">
                              #{index + 1}
                            </span>
                          </div>

                          {/* Rank Icon */}
                          <div className="flex-shrink-0 hidden sm:block">
                            {getRankIcon(index + 1)}
                          </div>

                          {/* Profile Picture */}
                          <div className="relative flex-shrink-0">
                            <img
                              src={user.profilePic}
                              alt={user.username}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 sm:border-3 border-[#ff6600] shadow-lg shadow-[#ff6600]/30"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-[#ff4da6] text-white text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                              {level}
                            </div>
                          </div>

                          {/* User Info - Mobile optimized */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <a
                                className="text-lg sm:text-xl font-bold text-white truncate underline hover:text-[#ff6600]"
                                href={`https://www.instagram.com/${user.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`View ${user.username}'s profile on Instagram`}
                              >
                                @{user.username}
                              </a>
                              <div className="flex items-center gap-2">
                                <div className="sm:hidden">
                                  {getRankIcon(index + 1)}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="border-[#ff6600] text-[#ff6600] text-xs"
                                >
                                  Level {level}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-[#ff4da6] font-semibold text-sm sm:text-base">
                              XP: {user.count.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* XP Progress Bar - Full width on mobile */}
                        <div className="w-full sm:w-48 sm:flex-shrink-0">
                          <div className="relative">
                            <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#ff6600] to-[#ff4da6] rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${progress}%` }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>{currentLevelXP}</span>
                              <span>{nextLevelXP}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
