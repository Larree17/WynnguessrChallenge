---

# WynnGuessr

Welcome to **WynnGuessr**, an interactive map-based guessing game inspired by GeoGuessr and set within the world of Wynncraft, an MMORPG in Minecraft! *WynnGuessr* challenges players to test their map knowledge by guessing specific locations within Wynncraft based on visual cues.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Future Plans](#future-plans)
7. [Contributing](#contributing)

---

## Project Overview
*WynnGuessr* was created to provide Wynncraft fans with a new way to engage with the game world. Inspired by GeoGuessr, *WynnGuessr* incorporates over 600 locations across Wynncraft and provides an immersive, location-based guessing experience for players.

## Features
- **Interactive Map**: Powered by Leaflet.js, the game features a custom, interactive map with 600+ locations for players to explore and guess.
- **User Authentication and Profiles**: User authentication lets players create profiles, save game history, and track progress.
- **Leaderboards**: Compete against others with dynamically updated leaderboards.
- **AWS-Optimized Performance**: Runs smoothly with AWS EC2 and EBS, supporting 100+ concurrent players while maintaining <2s load times.

## Technologies Used
- **Frontend**: JavaScript, HTML, CSS, Leaflet.js
- **Backend**: Python, Flask
- **Database**: SQL
- **Deployment**: AWS EC2, Nginx, Gunicorn

## Installation
To set up *WynnGuessr* locally:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Ched3/WynnGuessr.git
    cd WynnGuessr
    ```

2. **Install dependencies**:
   Ensure you have Python installed. Install required Python packages with:
    ```bash
    pip install -r requirements.txt
    ```

3. **Set up environment variables**:
   Create a `.env` file in the project root and configure your database URI and any necessary API keys.

4. **Run the application**:
    ```bash
    flask run
    ```

5. **Access the application**:
   Open [http://127.0.0.1:5000](http://127.0.0.1:5000) in your web browser to start playing *WynnGuessr* locally!

## Usage
- **Gameplay**: Players guess locations on the map based on in-game screenshots or map fragments.
- **Leaderboard**: Tracks top players; scores are updated in real-time.
- **User Profiles**: Users can view past scores, saved locations, and progress in their profiles.

## Future Plans
- **Expanded Map Options**: Adding more regions and unique locations from Wynncraft.
- **Game Modes**: Implementing timed modes and multi-player options.
- **Enhanced Leaderboards**: Regional and seasonal rankings.
- **Mobile Optimization**: Improving experience for mobile players.

## Contributing
I welcome contributions to enhance *WynnGuessr*! To contribute:
1. Fork the repository.
2. Create a new branch.
3. Make your changes and submit a pull request.

---

Feel free to reach out if you have any questions or feedback. Happy guessing!

