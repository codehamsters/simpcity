import time
import random
import os
import pickle  # ✅ Session Save ke liye
from instagrapi import Client
from dotenv import load_dotenv

# Load secret variables
load_dotenv()
USERNAME = os.getenv("INSTA_USERNAME")
PASSWORD = os.getenv("INSTA_PASSWORD")
GROUP_THREAD_ID = os.getenv("GROUP_THREAD_ID")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")

SESSION_FILE = "session.pkl"  # ✅ Session file ka naam

# Initialize Instagram Client
cl = Client()

def login():
    """Login with session or credentials"""
    if os.path.exists(SESSION_FILE):
        print("🔄 Loading saved session...")
        try:
            with open(SESSION_FILE, "rb") as f:
                session = pickle.load(f)
            cl.load_settings(session)  # ✅ Session load karega
            cl.relogin()  # ✅ Session se relogin
            print("✅ Logged in using session!")
            return
        except Exception as e:
            print(f"⚠ Session load failed: {e}, logging in again...")

    # Agar session fail ho gaya to normal login
    print("🔑 Logging in with username/password...")
    cl.login(USERNAME, PASSWORD)

    # ✅ Save session after login
    with open(SESSION_FILE, "wb") as f:
        pickle.dump(cl.get_settings(), f)
    print("✅ Session saved!")

# Login with session or credentials
login()

def get_group_members():
    """Fetch group members and return as dictionary"""
    try:
        group_info = cl.direct_thread(GROUP_THREAD_ID)
        return {user.pk: user.username for user in group_info.users}
    except Exception as e:
        print(f"❌ Error fetching group members: {e}")
        return {}

def mention_all():
    """Mentions all group members in batches (avoiding length limit)"""
    members = list(get_group_members().items())
    if not members:
        return "⚠ No members found!"

    batch_size = 5  # ✅ 5 members per message (length limit avoid)
    for i in range(0, len(members), batch_size):
        batch = members[i:i+batch_size]
        mentions = [{"user_id": user_id, "offset": 0, "length": 0} for user_id, _ in batch]
        message_text = " ".join([f"@{username}" for _, username in batch])

        cl.direct_send(text=message_text, thread_ids=[GROUP_THREAD_ID], mentions=mentions)
        print(f"✅ Mentioned {len(batch)} members: {message_text}")
        time.sleep(2)  # ✅ Delay to avoid rate limit

def check_messages():
    """Checks latest group messages & triggers mention if needed"""
    try:
        messages = cl.direct_messages(GROUP_THREAD_ID)

        if messages:
            latest_message = messages[0]
            sender_id = latest_message.user_id
            sender_username = cl.user_info(sender_id).username

            text = latest_message.text.lower().strip()

            if text == "mention all":
                if sender_username == ADMIN_USERNAME:
                    print("✅ Admin ne mention all command diya!")
                    mention_all()
                else:
                    cl.direct_send(text="❌ Bhai tu admin nahi hai!", thread_ids=[GROUP_THREAD_ID])
                    print(f"🚫 {sender_username} tried to use mention all.")

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
        username = current_members[member_id]
        message = random.choice([
            "Welcome @{username} to SimpCity! 🚀🔥",
            "Aree bhai! Ek aur simp aaya! 😆 Welcome @{username}! 🎉",
            "@{username} just entered the simp zone. Buckle up! 😂",
            "Ek naye simp ki entry hui hai! @{username}, welcome bhai! 💀🔥"
        ]).replace("{username}", username)
        cl.direct_send(text=message, thread_ids=[GROUP_THREAD_ID])
        print(f"✅ Welcomed {username} in group chat!")

    previous_members = current_members
    time.sleep(5)
