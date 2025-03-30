import time
import random
from instagrapi import Client

# Instagram Credentials
USERNAME = "simpcity.bot"
PASSWORD = "Rohan@1702$Insta"

# Group Chat Thread ID (Find using API or DevTools)
GROUP_THREAD_ID = "26822505924062792"

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
    """Fetch current group members"""
    try:
        group_info = cl.direct_thread(GROUP_THREAD_ID)
        return set(user.pk for user in group_info.users)
    except Exception as e:
        print(f"❌ Error fetching group members: {e}")
        return set()

# Track previous members
previous_members = get_group_members()

while True:
    current_members = get_group_members()
    
    # Detect new members
    new_members = current_members - previous_members

    for member_id in new_members:
        user_info = cl.user_info(member_id)
        username = user_info.username
        message = random.choice(WELCOME_MESSAGES).replace("{username}", username)

        cl.direct_send(text=message, thread_ids=[GROUP_THREAD_ID])
        print(f"✅ Welcomed {username} in group chat!")

    previous_members = current_members  # Update members list

    # Check every 5 minutes
    time.sleep(10)
