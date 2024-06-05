from flask import Flask, render_template, url_for, request, redirect, session
from flask_session import Session
import os
import sqlite3

app = Flask(__name__)
conn = sqlite3.connect('database.db', check_same_thread=False)
app.secret_key = os.urandom(24)
db = conn.cursor()


@app.route("/")
def index():
    if session['loggedin']:
        return render_template('index.html', username = db.execute("SELECT username FROM users WHERE id = ?", (session['user_id'],)).fetchone()[0])
    return render_template('index.html')

@app.route("/play")
def play():
    return render_template('play.html')

@app.route("/leaderboard")
def leaderboard():
    return render_template('leaderboard.html')

@app.route("/stats")
def stats():
    return render_template('stats.html')

@app.route("/game")
def game():
    return render_template('game.html')

@app.route("/login", methods=['POST', 'GET'])
def login():
    if request.method == 'POST':#user login request
        username = request.form['username']
        password = request.form['password']
        #successful login
        if db.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, password)).fetchall():
            session['loggedin'] = True
            session['user_id'] = db.execute("SELECT id FROM users WHERE username = ?", (username,)).fetchone()[0]
            return redirect('/')
        elif username == "" or password == "":
            return render_template('apology.html', message = "Please fill in all fields")
        else:
            return render_template('apology.html', message = "Invalid username or password")
    else:
        return render_template('login.html')

@app.route("/register", methods=['POST', 'GET'])
def register():
    if request.method == 'POST':#user registration request
        username = request.form['username']
        password = request.form['password']
        confirmation = request.form['confirmation']
        if password != confirmation:
            return render_template('apology.html', message = "Passwords do not match")
        elif db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchall():
            return render_template('apology.html', message = "Username already exists")
        elif username == "" or password == "" or confirmation == "":
            return render_template('apology.html', message = "Please fill in all fields")
        else:
            db.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
            conn.commit()
            return redirect('/')
    else:
        return render_template('register.html')
    
@app.route("/logout")
def logout():
    session['loggedin'] = False
    session['user_id'] = None
    return redirect('/')

@app.route("/profile")
def profile():
    return render_template('profile.html', profile = db.execute("SELECT * FROM users WHERE id = ?", (session['user_id'],)).fetchone())
    
@app.route("/apology")
def apology():
    message = request.args.get('message', 'Something went wrong')
    return render_template('apology.html', message = message)

if __name__ == "__main__":
    app.run(debug=True)