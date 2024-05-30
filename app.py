from flask import Flask, render_template, url_for, request, redirect

app = Flask(__name__)

@app.route("/")
def index():

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

@app.route("/register", methods=['POST', 'GET'])
def register():
    if request.method == 'POST':#user registration request
        username = request.form['username']
        password = request.form['password']
        confirmation = request.form['confirmation']
        if password != confirmation:
            print("Passwords do not match")
            return redirect(url_for('register.html', message = "Passwords do not match"))
        return redirect('login.html')
    else:
        return render_template('register.html')

@app.route("/login", methods=['POST', 'GET'])
def login():
    if request.method == 'POST':#user login request
        username = request.form['username']
        password = request.form['password']
        if username == 'admin' and password == 'admin':
            #cookies
            return redirect('/')
        else:
            return redirect('apology')
    else:
        return render_template('login.html')
    
@app.route("/apology")
def apology():
    message = request.args.get('message', 'Something went wrong')
    return render_template('apology.html', message = message)

if __name__ == "__main__":
    app.run(debug=True)