.schema
SELECT username, score, date, look, provinces FROM users JOIN scores ON users.id = scores.user_id ORDER BY score DESC LIMIT 50;