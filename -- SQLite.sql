.schema
SELECT username, score, date
FROM users
JOIN scores ON users.id = scores.user_id
ORDER BY score DESC
LIMIT 10;
SELECT * FROM scores;
SELECT * FROM users;