from flask import Flask, request
import os

app = Flask(__name__)

@app.route("/webhook", methods=["POST"])
def webhook():
    os.system("cd /home/ubuntu/simpcity && git pull origin main && pm2 restart simpcitybot")
    return "Updated & Restarted!", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
