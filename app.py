from flask import Flask, render_template, url_for, request, redirect, session, send_from_directory, jsonify 
from flask_session import Session
from flask_cors import CORS
import os
import sqlite3
from datetime import date


app = Flask(__name__)
CORS(app)
app.secret_key = os.urandom(24)
conn = sqlite3.connect('database.db', check_same_thread=False)
db = conn.cursor()

@app.route("/api/locations", methods = ['GET'])
def get_locations():
    locations = db.execute("SELECT * FROM WynnProvince").fetchall()
    locations_list = [{"id": location[0], "X" : location[1], "Z" : location[2], "url" : location[3]} for location in locations]
    return jsonify(locations_list)


@app.route("/api/score", methods=['POST'])
def post_score():
    if request.method == 'POST':
        if not session.get('loggedin'):
            return jsonify({"success": False})
        score = request.form['score']
        look = request.form['look']
        provinces = request.form['provinces']
        rounds = request.form['rounds']
        totalTime = request.form['totalTime']
        hours = int(totalTime) // 3600
        minutes = (int(totalTime) % 3600) // 60
        seconds = int(totalTime) % 60
        if hours > 0:
            totalTime = str(hours) + "h " + str(minutes) + "m " + str(seconds) + "s"
        elif minutes > 0:
            totalTime = str(minutes) + "m " + str(seconds) + "s"
        else:
            totalTime = str(seconds) + "s"
        db.execute("INSERT INTO scores (user_id, score, date, look, provinces, rounds, time) VALUES (?, ?, ?, ?, ?, ?, ?)", (session['user_id'], score, date.today(), look, provinces, rounds, totalTime))
        conn.commit()
        return jsonify({"success": True})
    return jsonify({"success": False})

@app.route("/")
def index():
    if 'loggedin' in session and session['loggedin']:
        return render_template('index.html', username = db.execute("SELECT username FROM users WHERE id = ?", (session['user_id'],)).fetchone()[0])
    return render_template('index.html', username = "Guest")

@app.route("/mode")
def play():
    return render_template('mode.html')

@app.route("/leaderboard")
def leaderboard():
    return render_template('leaderboard.html', users = db.execute("SELECT username, score, date, look, provinces, rounds, time FROM users JOIN scores ON users.id = scores.user_id ORDER BY score DESC LIMIT 50;").fetchall())

@app.route("/stats")
def stats():
    return render_template('stats.html')

@app.route("/game", methods=['POST', 'GET'])
def game():
    if request.method == 'POST':
        if request.form.getlist('province') == []:
            return render_template('apology.html', message = "Please select at least one province")            
        provinces = request.form.getlist('province')
        print("time-limit-checkbox:")
        print(request.form.get('time-limit-checkbox'))
        if request.form.get('time-limit-checkbox') == None:
            time_limit = -1
        elif request.form.get('time-limit-checkbox') == 'on':
            if request.form.get('time-limit') == "":
                return render_template('apology.html', message = "Please enter a time limit")
            if request.form.get('time-limit').isnumeric() == False:
                return render_template('apology.html', message = "Time limit must be a number")
            if int(request.form.get('time-limit')) < 1:
                return render_template('apology.html', message = "Time limit cannot be less than 1 second")
            time_limit = int(request.form.get('time-limit'))
        look = request.form.get('look') == 'on'
        rounds = request.form.get('rounds')
        print(provinces)
        print("Time limit: " + str(time_limit))
        print("Look: " + str(look))
        print("Rounds = " + rounds)
        return render_template('game.html', provinces = provinces, time_limit = time_limit, look = look, rounds = rounds)
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
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        confirmation = request.form['confirmation']
        if password != confirmation:
            return render_template('apology.html', message = "Passwords do not match")
        elif db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchall():
            return render_template('apology.html', message = "Username is already taken")
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