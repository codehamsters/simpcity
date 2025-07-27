"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Medal, Award } from "lucide-react";
import {
  supabase,
  type LeaderboardEntry,
  type CurrentMember,
} from "./lib/supabase";

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
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [currentMembersData, setCurrentMembersData] = useState<CurrentMember[]>(
    []
  );
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showCurrentMembers, setShowCurrentMembers] = useState(true);

  // Separate pagination states for each view
  const [leaderboardPage, setLeaderboardPage] = useState(0);
  const [currentMembersPage, setCurrentMembersPage] = useState(0);
  const [leaderboardHasMore, setLeaderboardHasMore] = useState(true);
  const [currentMembersHasMore, setCurrentMembersHasMore] = useState(true);

  // Track loaded user IDs to prevent duplicates
  const [loadedLeaderboardIds, setLoadedLeaderboardIds] = useState<Set<string>>(
    new Set()
  );
  const [loadedCurrentMemberIds, setLoadedCurrentMemberIds] = useState<
    Set<string>
  >(new Set());

  const ITEMS_PER_PAGE = 20;

  // Fetch stats data
  async function fetchStats() {
    try {
      const { data, error } = await supabase
        .from("stats")
        .select("value")
        .eq("key", "total_count")
        .maybeSingle();

      if (error) {
        console.error("Error fetching stats:", error);
        return 0;
      }

      if (!data) {
        console.warn("No total_count found in stats table");
        return 0;
      }

      return data.value || 0;
    } catch (error) {
      console.error("Error fetching stats:", error);
      return 0;
    }
  }

  // Deduplicate data based on userid
  function deduplicateData<T extends { userid: string }>(
    existingData: T[],
    newData: T[],
    loadedIds: Set<string>
  ): T[] {
    const filteredNewData = newData.filter(
      (item) => !loadedIds.has(item.userid)
    );
    return [...existingData, ...filteredNewData];
  }

  // Fetch leaderboard data with pagination
  async function fetchLeaderboardData(page = 0, append = false) {
    try {
      if (page === 0 && !append) {
        setLoading(true);
        setLoadedLeaderboardIds(new Set()); // Reset loaded IDs when starting fresh
      } else {
        setLoadingMore(true);
      }

      const offset = page * ITEMS_PER_PAGE;
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("count", { ascending: false })
        .order("id", { ascending: true }) // Secondary sort for consistent ordering
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        return;
      }

      const newData = data || [];

      if (append) {
        // Deduplicate and append new data
        const deduplicatedData = deduplicateData(
          leaderboardData,
          newData,
          loadedLeaderboardIds
        );
        setLeaderboardData(deduplicatedData);

        // Update loaded IDs
        const newIds = new Set([
          ...loadedLeaderboardIds,
          ...newData.map((item) => item.userid),
        ]);
        setLoadedLeaderboardIds(newIds);
      } else {
        setLeaderboardData(newData);
        // Set last updated from first entry
        if (newData.length > 0) {
          setLastUpdated(newData[0].updated_at);
        }

        // Initialize loaded IDs
        const newIds = new Set(newData.map((item) => item.userid));
        setLoadedLeaderboardIds(newIds);
      }

      // Check if there's more data
      setLeaderboardHasMore(newData.length === ITEMS_PER_PAGE);
      setLeaderboardPage(page);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Fetch current members data with pagination
  async function fetchCurrentMembersData(page = 0, append = false) {
    try {
      if (page === 0 && !append) {
        setLoading(true);
        setLoadedCurrentMemberIds(new Set()); // Reset loaded IDs when starting fresh
      } else {
        setLoadingMore(true);
      }

      const offset = page * ITEMS_PER_PAGE;
      const { data, error } = await supabase
        .from("current_members")
        .select("*")
        .order("count", { ascending: false })
        .order("id", { ascending: true }) // Secondary sort for consistent ordering
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) {
        console.error("Error fetching current members:", error);
        return;
      }

      const newData = data || [];

      if (append) {
        // Deduplicate and append new data
        const deduplicatedData = deduplicateData(
          currentMembersData,
          newData,
          loadedCurrentMemberIds
        );
        setCurrentMembersData(deduplicatedData);

        // Update loaded IDs
        const newIds = new Set([
          ...loadedCurrentMemberIds,
          ...newData.map((item) => item.userid),
        ]);
        setLoadedCurrentMemberIds(newIds);
      } else {
        setCurrentMembersData(newData);
        // Set last updated from first entry if leaderboard data is empty
        if (newData.length > 0 && !lastUpdated) {
          setLastUpdated(newData[0].updated_at);
        }

        // Initialize loaded IDs
        const newIds = new Set(newData.map((item) => item.userid));
        setLoadedCurrentMemberIds(newIds);
      }

      // Check if there's more data
      setCurrentMembersHasMore(newData.length === ITEMS_PER_PAGE);
      setCurrentMembersPage(page);
    } catch (error) {
      console.error("Error fetching current members data:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Load more data for infinite scroll
  async function loadMoreData() {
    if (loadingMore) return;

    if (showCurrentMembers) {
      if (!currentMembersHasMore) return;
      const nextPage = currentMembersPage + 1;
      await fetchCurrentMembersData(nextPage, true);
    } else {
      if (!leaderboardHasMore) return;
      const nextPage = leaderboardPage + 1;
      await fetchLeaderboardData(nextPage, true);
    }
  }

  // Initial data fetch
  useEffect(() => {
    async function initializeData() {
      const totalCountValue = await fetchStats();
      setTotalCount(totalCountValue);

      // Load both datasets initially
      await Promise.all([
        fetchLeaderboardData(0, false),
        fetchCurrentMembersData(0, false),
      ]);
    }

    initializeData();
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 // Trigger 1000px before bottom
      ) {
        loadMoreData();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    loadingMore,
    showCurrentMembers,
    leaderboardHasMore,
    currentMembersHasMore,
    leaderboardPage,
    currentMembersPage,
  ]);

  // Handle view toggle
  const handleToggleView = (showCurrent: boolean) => {
    setShowCurrentMembers(showCurrent);
    // Scroll to top when switching views
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get current display data and pagination state
  const displayData = showCurrentMembers ? currentMembersData : leaderboardData;
  const hasMore = showCurrentMembers
    ? currentMembersHasMore
    : leaderboardHasMore;

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

  function openInstagramLink(appUrl: string, webUrl: string) {
    // Try to open the Instagram app
    try {
      window.location.href = appUrl;
    } catch (error) {
      console.error("Failed to open Instagram app:", error);
    }
    window.open(webUrl, "_blank");
  }

  if (loading && displayData.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6600] mx-auto mb-4"></div>
          <p className="text-white">Loading SimpCity leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Cyber background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50" />
      <div className="absolute inset-0 simpcity-radial-bg" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Navbar */}
        <div className="flex flex-row justify-between items-center bg-black/60 backdrop-blur-md rounded-2xl px-4 py-3 mb-6 shadow-lg border border-[#222]">
          {/* Logo with gradient border */}
          <div className="inline-block w-40 items-center rounded-full">
            <img
              src="/simpcity-logo.png?height=80&width=200"
              alt="SimpCity Logo"
              className="h-16 w-auto rounded-full bg-black p-[1px] simpcity-gradient"
            />
          </div>
          <span className="hidden sm:block w-40 text-2xl text-center font-bold simpcity-gradient-text">
            SimpCity
          </span>
          {/* CTA Button */}
          <button
            type="button"
            onClick={() =>
              openInstagramLink(
                "instagram://user?username=simpcity.gc",
                "https://instagram.com/simpcity.gc/"
              )
            }
            className="font-bold px-4 py-2.5 rounded-full bg-[#18181b]/90 text-white border border-white/40 shadow-md transition duration-200 ease-in-out hover:text-[#ff6600] hover:border-[#ff6600] hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ff6600] focus:ring-offset-2 text-md tracking-wide uppercase text-center"
            style={{
              boxShadow:
                "0 2px 12px 0 rgba(255, 179, 71, 0.10), 0 1.5px 6px 0 rgba(255, 235, 193, 0.07)",
            }}
            title="Join SimpCity on Instagram"
          >
            <span className="transition duration-200">Join Chat</span>
          </button>
        </div>

        {/* Total Messages */}
        <div className="text-center mb-6">
          <span className="inline-block px-4 py-2 rounded-full bg-black/70 border border-[#ff6600] simpcity-gradient-text font-bold text-lg sm:text-xl tracking-wide">
            Total Messages: {totalCount.toLocaleString()}
          </span>
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

        {/* Toggle Buttons for Current Members / All Time */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-full font-bold transition ${
              showCurrentMembers
                ? "simpcity-gradient-text border border-[#ff6600]"
                : "bg-black text-white border border-gray-700"
            }`}
            onClick={() => handleToggleView(true)}
          >
            Current Members
          </button>
          <button
            className={`px-4 py-2 rounded-full font-bold transition ${
              !showCurrentMembers
                ? "simpcity-gradient-text border border-[#ff6600]"
                : "bg-black text-white border border-gray-700"
            }`}
            onClick={() => handleToggleView(false)}
          >
            All Time
          </button>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4 mb-32">
          {displayData.map((user, index) => {
            const { level, currentLevelXP, nextLevelXP, progress } =
              calculateLevel(user.count);
            // Calculate position based on current view
            const position = index + 1;
            // Create unique key using view type, userid, and index
            const uniqueKey = `${showCurrentMembers ? "current" : "all"}-${
              user.userid
            }-${index}`;

            return (
              user.username !== "unknown" && (
                <Card
                  key={uniqueKey}
                  className="bg-gray-900/80 border-gray-700 hover:border-[#ff6600] transition-all duration-300 hover:shadow-lg hover:shadow-[#ff6600]/20 backdrop-blur-sm"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-col gap-3 sm:gap-4">
                      {/* Mobile: Top row with rank, profile, and basic info */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-gray-800 to-gray-700 border-2 border-gray-600 flex-shrink-0">
                          <span className="text-lg sm:text-xl font-bold text-white">
                            #{position}
                          </span>
                        </div>

                        {/* Rank Icon */}
                        <div className="flex-shrink-0 hidden sm:block">
                          {getRankIcon(position)}
                        </div>

                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={user.profilepic || "/placeholder.svg"}
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
                              onClick={(e) => {
                                e.preventDefault();
                                openInstagramLink(
                                  `instagram://user?username=${user.username}`,
                                  `https://www.instagram.com/${user.username}`
                                );
                              }}
                            >
                              @{user.username}
                            </a>
                            <div className="flex items-center gap-2">
                              <div className="sm:hidden">
                                {getRankIcon(position)}
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
                          {/* XP Progress Bar - Full width on mobile */}
                          <div className="w-full sm:flex-shrink-0">
                            <div className="relative">
                              <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                                <div
                                  className="h-full simpcity-gradient rounded-full transition-all duration-1000 ease-out relative"
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            );
          })}
        </div>

        {/* Loading indicator for infinite scroll */}
        {loadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6600]"></div>
            <span className="ml-3 text-[#ff6600] font-semibold">
              Loading more simps...
            </span>
          </div>
        )}

        {/* End of data indicator */}
        {!hasMore && !loading && displayData.length > 0 && (
          <div className="text-center py-8">
            <span className="text-gray-400 font-semibold">
              You've reached the bottom! No more simps to show.
            </span>
          </div>
        )}

        {/* No data message */}
        {displayData.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
