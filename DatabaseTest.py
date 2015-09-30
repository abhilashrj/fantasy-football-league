import json
import sqlite3
import http.client
APIKEY = "ab22804642e54e6b8c943c70eb9eae09"


conn=sqlite3.connect("fantasy.sqlite3")
cur=conn.cursor()
cur.execute("DROP TABLE FantasyLeague"	)
cur.execute("CREATE TABLE FantasyLeague (id INTEGER PRIMARY KEY NOT NULL,caption TEXT,league TEXT,year INTEGER,numberOfTeams INTEGER,numberOfGames INTEGER,lastUpdated TEXT)")
soccer_League_prefix = '/alpha/soccerseasons/'
season_ids = []
connection = http.client.HTTPConnection('api.football-data.org')
headers = { 'X-Auth-Token': APIKEY }
'''
connection.request('GET', soccer_League_prefix, None, headers )
response = json.loads(connection.getresponse().read().decode())

for row in response:
	season_ids.append(row['_links']['self']['href'].rsplit('/',1)[-1])
    tup=(int(row['_links']['self']['href'].rsplit('/',1)[-1]),row['caption'],row['league'],row['year'],row['numberOfTeams'],row['numberOfGames'],row['lastUpdated'])
    cur.execute('INSERT INTO FantasyLeague VALUES(?,?,?,?,?,?,?)',tup)
    del tup
conn.commit()
'''
  
#cur.execute("SELECT * FROM FantasyLeague")
#rows = cur.fetchall()

#for row in rows:
#    print (row)
for id in season_ids:
	fixture_url = soccer_League_prefix + id
	connection.request('GET', fixture_url, None, headers)
	tup = 

cur.close()