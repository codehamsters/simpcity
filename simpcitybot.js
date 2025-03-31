require("dotenv").config(); // Load environment variables
const axios = require("axios");

const GROUP_IDS = process.env.GROUP_IDS.split(","); // Multiple group IDs (comma separated)
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const INTERVAL = 60 * 1000; // 1 minute

let knownMembers = {}; // Store previous members list

// Function to fetch group members
async function getGroupMembers(groupId) {
  try {
    const url = `https://graph.facebook.com/v18.0/${groupId}/participants?access_token=${ACCESS_TOKEN}`;
    const response = await axios.get(url);
    return response.data.data.map((member) => member.id);
  } catch (error) {
    console.error(
      `Error fetching members for Group ${groupId}:`,
      error.response?.data || error.message
    );
    return [];
  }
}

// Function to welcome new members
async function welcomeNewMembers(groupId, newMembers) {
  for (const memberId of newMembers) {
    const message = `Welcome <@${memberId}> to SimpCity! 🎉👀 Drop a message and introduce yourself!`;
    await sendMessage(groupId, message);
  }
}

// Function to send a message
async function sendMessage(groupId, message) {
  try {
    const url = `https://graph.facebook.com/v18.0/${groupId}/messages?access_token=${ACCESS_TOKEN}`;
    await axios.post(url, { message });
    console.log(`✅ Sent welcome message to Group ${groupId}`);
  } catch (error) {
    console.error(
      `❌ Error sending message:`,
      error.response?.data || error.message
    );
  }
}

// Function to check for new members
async function checkForNewMembers(groupId) {
  const members = await getGroupMembers(groupId);

  if (!knownMembers[groupId]) {
    knownMembers[groupId] = members; // First time setup
    return;
  }

  const newMembers = members.filter(
    (member) => !knownMembers[groupId].includes(member)
  );

  if (newMembers.length > 0) {
    console.log(`🎉 New members detected in Group ${groupId}:`, newMembers);
    await welcomeNewMembers(groupId, newMembers);
  }

  knownMembers[groupId] = members; // Update known members list
}

// Function to check all groups every 1 minute
async function monitorGroups() {
  for (const groupId of GROUP_IDS) {
    await checkForNewMembers(groupId);
  }
}

// Start checking every 1 minute
setInterval(monitorGroups, INTERVAL);

console.log("🚀 Auto-Welcome Bot is Running...");
