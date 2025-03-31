from flask import Flask, render_template, url_for, request, redirect, session, send_from_directory, jsonify 
from flask_session import Session
from flask_cors import CORS
import os
import sqlite3
from datetime import date
from flask_bcrypt import Bcrypt 
from config import Config

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app) 
app.config.from_object(Config)
conn = sqlite3.connect('database.db', check_same_thread=False)
db = conn.cursor()

@app.route("/api/locations", methods = ['GET'])
def get_locations():
    #if there are no provinces in session, return apology
    if 'provinces' not in session:
        return jsonify({"success": False})
    provinces = session['provinces']
    placeholders = ', '.join('?' for _ in provinces)
    query = f"SELECT * FROM locations WHERE province IN ({placeholders})"
    locations = db.execute(query, provinces).fetchall()
    locations_list = [{"id": location[0], "X" : location[1], "Z" : location[2], "url" : location[3]} for location in locations]
    return jsonify(locations_list)


@app.route("/api/score", methods=['POST'])
def post_score():
    if request.method == 'POST':
        if not session.get('loggedin'):
            return jsonify({"success": False})
        score = request.form['score']
        look = request.form['look']
        if look == 'True':
            look = 'Yes'
        else:
            look = 'No'
        provinces = request.form['provinces']
        if request.form['rounds'] not in ['3', '5', '10', '25']:
            return render_template('apology.html', message = "Invalid number of rounds")
        rounds = request.form['rounds']
        totalTime = request.form['totalTime']
        print(int(rounds) * 5000)
        if(int(score) > int(rounds) * 5000):
            return jsonify({"success": False})
        if(int(rounds) * 5000 == int(score) and int(totalTime) < .5):
            return jsonify({"success": False})
        db.execute("INSERT INTO scores (user_id, score, date, nolook, provinces, rounds, time) VALUES (?, ?, ?, ?, ?, ?, ?)", (session['user_id'], score, date.today(), look, provinces, rounds, totalTime))
        conn.commit()
        return jsonify({"success": True})
    return jsonify({"success": False})

@app.route("/api/updaterank", methods=['POST'])
def update_rank():
    if request.method == 'POST':
        form = request.form
        rankings = db.execute('''
            SELECT users.username, scores.score, scores.date, scores.nolook, scores.rounds, scores.time
            FROM users
            JOIN (SELECT user_id, 
                    MAX(score) as max_score
                 FROM 
                    scores
                 WHERE 
                    provinces = ? AND nolook = ? AND rounds = ?
                 GROUP BY 
                    user_id
                ) as top_scores
            ON 
                users.id = top_scores.user_id
            JOIN 
                scores
            ON 
                scores.user_id = top_scores.user_id AND scores.score = top_scores.max_score
            WHERE 
                scores.provinces = ? AND scores.nolook = ? AND scores.rounds = ?
            ORDER BY 
                scores.score DESC, scores.time ASC
            LIMIT 50
        ''', (str(form['provinces']), form['nolook'], form['rounds'], str(form['provinces']), form['nolook'], form['rounds'])).fetchall()
        
        return jsonify({"rankings": rankings})
    return jsonify({"success": False})

@app.route("/api/updateprofile", methods=['POST'])
def update_profile():
    if request.method == 'POST':
        form = request.form
        games = db.execute('SELECT username, score, date, nolook, rounds, time FROM users JOIN scores ON users.id = scores.user_id WHERE user_id = ? AND provinces = ? AND nolook = ? AND rounds = ? ORDER BY score DESC, time ASC LIMIT 50', (session['user_id'], str(form['provinces']), form['nolook'], form['rounds'])).fetchall()
        return jsonify({"games": games})
    return jsonify({"success": False})

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/mode")
def play():
    return render_template('mode.html')

@app.route("/leaderboard")
def leaderboard():
    return render_template('leaderboard.html')

@app.route("/game", methods=['POST', 'GET'])
def game():
    session['provinces'] = ['wynn', 'gavel', 'corkus', 'ocean', 'silent-expanse', 'challengeOne']
    if request.method == 'POST':
        #if there are no provinces selected, return apology
        if request.form.getlist('province') == []:
            return render_template('apology.html', message = "Please select at least one province")            
        provinces = request.form.getlist('province')
        #if time limit is not selected, set time limit to -1
        if request.form.get('time-limit-checkbox') == None:
            time_limit = -1
        #if time limit is selected, check if time limit is a number and greater than 0
        elif request.form.get('time-limit-checkbox') == 'on':
            #if time limit is not entered, return apology
            if request.form.get('time-limit') == "":
                return render_template('apology.html', message = "Please enter a time limit")
            #if time limit is not a number, return apology
            if request.form.get('time-limit').isnumeric() == False:
                return render_template('apology.html', message = "Time limit must be a number")
            #if time limit is less than 1, return apology
            if int(request.form.get('time-limit')) < 0:
                return render_template('apology.html', message = "Time limit cannot be less than 0 seconds")
            if int(request.form.get('time-limit')) > 1800:
                return render_template('apology.html', message = "Time limit cannot be greater than 30 minutes")
            time_limit = int(request.form.get('time-limit'))
        #if look is not selected, set look to False
        look = request.form.get('look') == 'on'
        rounds = request.form.get('rounds')
        #store provinces in session
        session['provinces'] = provinces
        print(provinces, time_limit, look, rounds)

        return render_template('game.html', provinces = provinces, time_limit = time_limit, look = look, rounds = rounds)
    return render_template('game.html', provinces = "['wynn', 'gavel', 'corkus', 'ocean', 'silent-expanse', 'challengeOne']", time_limit = -1, look = False, rounds = 5)

@app.route("/login", methods=['POST', 'GET'])
def login():
    if request.method == 'POST':#user login request
        username = request.form['username']
        password = request.form['password']
        
        if username == "" or password == "":
            return render_template('apology.html', message = "Please fill in all fields")
        user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        if user and bcrypt.check_password_hash(user[2], password):
            session['loggedin'] = True
            session['user_id'] = user[0]
            return redirect('/')
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
        if len(username) > 20:
            return render_template('apology.html', message = "Username must be less than 32 characters")
        if len(password) > 64:
            return render_template('apology.html', message = "Password must be less than 128 characters")
        if password != confirmation:
            return render_template('apology.html', message = "Passwords do not match")
        elif db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchall():
            return render_template('apology.html', message = "Username is already taken")
        elif username == "" or password == "" or confirmation == "":
            return render_template('apology.html', message = "Please fill in all fields")
        else:
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            db.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
            conn.commit()
            user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
            session['loggedin'] = True
            session['user_id'] = user[0]
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
    if not session.get('loggedin'):
        return redirect('/login')
    profile = db.execute("SELECT username FROM users WHERE id = ?", (session['user_id'],)).fetchone()
    return render_template('profile.html', username = profile[0])
    
@app.route("/apology")
def apology():
    message = request.args.get('message', 'Something went wrong')
    return render_template('apology.html', message = message)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
