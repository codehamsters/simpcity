import time
import random
import os
from instagrapi import Client
from dotenv import load_dotenv

# Load secret variables from .env file
load_dotenv()

USERNAME = os.getenv("INSTA_USERNAME")
PASSWORD = os.getenv("INSTA_PASSWORD")
GROUP_THREAD_ID = os.getenv("GROUP_THREAD_ID")

# Welcome Messages List
WELCOME_MESSAGES = [
    "Welcome @{username} to SimpCity! 🚀🔥",
    "Aree bhai! Ek aur simp aaya! 😆 Welcome @{username}! 🎉",
    "@{username} just entered the simp zone. Buckle up! 😂",
    "Ek naye simp ki entry hui hai! @{username}, welcome bhai! 💀🔥"
]

# Login to Instagram
cl = Client()
cl.login(USERNAME, PASSWORD)

def get_group_members():
    """Fetch group members and return as dictionary"""
    try:
        group_info = cl.direct_thread(GROUP_THREAD_ID)
        members = {user.pk: user.username for user in group_info.users}
        print("🟢 Current Group Members:", members)  # Debugging line
        return members
    except Exception as e:
        print(f"❌ Error fetching group members: {e}")
        return {}
    
def mention_all():
    """Mentions all group members"""
    members = get_group_members()
    if not members:
        return "⚠ No members found!"
    
    mentions = " ".join([f"@{username}" for username in members.values()])
    message = f"🚀 Mentioning everyone: {mentions}"
    
    cl.direct_send(text=message, thread_ids=[GROUP_THREAD_ID])
    print(f"✅ Mentioned all members: {mentions}")

def check_messages():
    """Checks latest group messages & triggers mention if needed"""
    try:
        messages = cl.direct_messages(GROUP_THREAD_ID)
        latest_message = messages[0].text.lower() if messages else ""

        if "mention all" in latest_message:
            mention_all()

    except Exception as e:
        print(f"❌ Error checking messages: {e}")

# Track previous members
previous_members = get_group_members()

while True:
    check_messages()
    current_members = get_group_members()
    
    # Detect new members
    new_member_ids = set(current_members.keys()) - set(previous_members.keys())

    for member_id in new_member_ids:
        username = current_members[member_id]  # Fetch username from dictionary
        message = random.choice(WELCOME_MESSAGES).replace("{username}", username)
        cl.direct_send(text=message, thread_ids=[GROUP_THREAD_ID])
        print(f"✅ Welcomed {username} in group chat!")

    previous_members = current_members  # Update members list

    # Check every 10 seconds
    time.sleep(5)
