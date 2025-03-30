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
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")  # 👈 Sirf tu use kar sake

# Welcome Messages List
WELCOME_MESSAGES = [
    "Welcome @{username} to SimpCity! 🚀🔥",
    "Aree bhai! Ek aur simp aaya! 😆 Welcome @{username}! 🎉",
    "@{username} just entered the simp zone. Buckle up! 😂",
    "Ek naye simp ki entry hui hai! @{username}, welcome bhai! 💀🔥"
]

# Initialize Instagram Client
cl = Client()
SESSION_FILE = "session.json"  # ✅ Session file name

def login():
    """Logs in to Instagram with session persistence"""
    if os.path.exists(SESSION_FILE):
        try:
            cl.load_settings(SESSION_FILE)  # ✅ Load previous session
            cl.login(USERNAME, PASSWORD)   # ✅ Verify session works
            print("✅ Reused saved session!")
            return
        except Exception:
            print("❌ Failed to use saved session, logging in again...")

    # Fresh login (if no session found or it fails)
    cl.login(USERNAME, PASSWORD)
    cl.dump_settings(SESSION_FILE)  # ✅ Save new session
    print("✅ Logged in & session saved!")

# Call login function once
login()

def get_group_members():
    """Fetch group members and return as dictionary"""
    try:
        group_info = cl.direct_thread(GROUP_THREAD_ID)
        members = {user.pk: user.username for user in group_info.users}
        return members
    except Exception as e:
        print(f"❌ Error fetching group members: {e}")
        return {}

# Track previous members
previous_members = get_group_members()

while True:
    current_members = get_group_members()
    
    # Detect new members
    new_member_ids = set(current_members.keys()) - set(previous_members.keys())

    for member_id in new_member_ids:
        username = current_members[member_id]  
        message = random.choice(WELCOME_MESSAGES).replace("{username}", username)
        cl.direct_send(text=message, thread_ids=[GROUP_THREAD_ID])
        print(f"✅ Welcomed {username} in group chat!")

    previous_members = current_members  # Update members list

    # Check every 5 seconds
    time.sleep(300)
