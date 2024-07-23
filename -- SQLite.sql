.schema
DROP TABLE IF EXISTS scores;
CREATE TABLE scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT  ,  
    user_id INTEGER    ,
    score INTEGER   ,
    date TEXT  ,
    look BOOLEAN  ,
    provinces TEXT ,
    rounds INTEGER  ,
    time INTEGER
);