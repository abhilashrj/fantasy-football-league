import json
import sqlite3
import http.client
APIKEY = "ab22804642e54e6b8c943c70eb9eae09"


conn=sqlite3.connect("fantasy.sqlite3")
cur=conn.cursor()
cur.execute("DROP TABLE FantasyLeague"	)
cur.execute("CREATE TABLE FantasyLeague (id TEXT /*PRIMARY KEY NOT NULL*/,caption TEXT,league TEXT,year INTEGER,numberOfTeams INTEGER,numberOfGames INTEGER,lastUpdated TEXT)")

connection = http.client.HTTPConnection('api.football-data.org')
headers = { 'X-Auth-Token': APIKEY }
connection.request('GET', '/alpha/soccerseasons', None, headers )
response = json.loads(connection.getresponse().read().decode())

for row in response:
    tup=("Azeem is idiot",row['caption'],row['league'],row['year'],row['numberOfTeams'],row['numberOfGames'],row['lastUpdated'])
    cur.execute('INSERT INTO FantasyLeague VALUES(?,?,?,?,?,?,?)',tup)
    del tup
conn.commit()

cur = conn.cursor()    
cur.execute("SELECT * FROM FantasyLeague")
rows = cur.fetchall()

for row in rows:
    print (row)

cur.close()