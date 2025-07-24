import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("simpcity_leaderboard")
    const collection = db.collection("leaderboard")

    const leaderboardData = await collection
      .find({})
      .sort({ count: -1 })
      .toArray()

    // Convert _id to string for JSON serialization
    const data = leaderboardData.map(({ _id, userId, count, profilePic, username, updatedAt }) => ({
      _id: _id.toString(),
      userId,
      count,
      profilePic,
      username,
      updatedAt: updatedAt ? updatedAt.toISOString() : null,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard data" }, { status: 500 })
  }
}
