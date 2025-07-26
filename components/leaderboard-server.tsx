import {
  supabase,
  type LeaderboardEntry,
  type CurrentMember,
} from "@/lib/supabase";
import LeaderboardClient from "./leaderboard-client";

async function fetchInitialData() {
  const ITEMS_PER_PAGE = 20;

  // Fetch leaderboard data
  const { data: leaderboardData, error: leaderboardError } = await supabase
    .from("leaderboard")
    .select("*")
    .order("count", { ascending: false })
    .order("id", { ascending: true })
    .range(0, ITEMS_PER_PAGE - 1);

  if (leaderboardError) {
    console.error("Error fetching leaderboard data:", leaderboardError);
  }

  // Fetch current members data
  const { data: currentMembersData, error: currentMembersError } =
    await supabase
      .from("current_members")
      .select("*")
      .order("count", { ascending: false })
      .order("id", { ascending: true })
      .range(0, ITEMS_PER_PAGE - 1);

  if (currentMembersError) {
    console.error("Error fetching current members data:", currentMembersError);
  }

  // Fetch total count from stats
  const { data: statsData, error: statsError } = await supabase
    .from("stats")
    .select("value")
    .eq("key", "total_count")
    .maybeSingle();

  if (statsError) {
    console.error("Error fetching stats:", statsError);
  }

  const totalCount = statsData?.value ?? 0;

  return {
    leaderboardData: leaderboardData ?? [],
    currentMembersData: currentMembersData ?? [],
    totalCount,
  };
}

export default async function LeaderboardServer() {
  const { leaderboardData, currentMembersData, totalCount } =
    await fetchInitialData();

  return (
    <LeaderboardClient
      initialLeaderboardData={leaderboardData}
      initialCurrentMembersData={currentMembersData}
      initialTotalCount={totalCount}
    />
  );
}
