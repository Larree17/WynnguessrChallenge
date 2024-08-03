.schema
SELECT * FROM scores;
SELECT username, score, date, nolook, rounds, time FROM users JOIN scores ON users.id = scores.user_id ORDER BY score DESC, time ASC LIMIT 50