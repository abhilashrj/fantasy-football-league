import json
import sqlite3
import http.client
APIKEY = "ab22804642e54e6b8c943c70eb9eae09"


conn=sqlite3.connect("fantasy.sqlite3")
cur=conn.cursor()
cur.execute("DROP TABLE IF EXISTS Leagues")
cur.execute("CREATE TABLE Leagues (id INTEGER PRIMARY KEY NOT NULL,caption TEXT,league TEXT,year INTEGER,numberOfTeams INTEGER,numberOfGames INTEGER,lastUpdated TEXT)")
soccer_League_prefix = '/alpha/soccerseasons/'
season_ids = []
connection = http.client.HTTPConnection('api.football-data.org')
headers = { 'X-Auth-Token': APIKEY }

connection.request('GET', soccer_League_prefix, None, headers )
response = json.loads(connection.getresponse().read().decode())

for row in response:
	season_ids.append(row['_links']['self']['href'].rsplit('/',1)[-1])
	tup=(int(row['_links']['self']['href'].rsplit('/',1)[-1]),row['caption'],row['league'],row['year'],row['numberOfTeams'],row['numberOfGames'],row['lastUpdated'])
	cur.execute('INSERT INTO Leagues VALUES(?,?,?,?,?,?,?)',tup)
	del tup
conn.commit()


#cur.execute("SELECT * FROM FantasyLeague")
#rows = cur.fetchall()

#for row in rows:
#    print (row)

cur.execute("DROP TABLE IF EXISTS Fixtures")
cur.execute("CREATE TABLE Fixtures (Period_id INTEGER, homeTeam TEXT,awayTeam TEXT,_date DATE,status TEXT, matchday INTEGER, goalsAwayTeam INTEGER,goalsHomeTeam INTEGER, PRIMARY KEY (homeTeam,awayTeam))")
#print(season_ids)

for id in season_ids:
	fixture_url = soccer_League_prefix + id + '/fixtures'
	#print(fixture_url)
	connection.request('GET', fixture_url, None, headers)
	response = json.loads(connection.getresponse().read().decode())
	print(type(response))
	for dic in response['fixtures']:
		tup = (dic['homeTeamName'],dic['awayTeamName'],dic['date'],dic['status'],int(dic['matchday']),int(dic['result']['goalsHomeTeam']),int(dic['result']['goalsAwayTeam']))
		cur.execute('INSERT INTO Fixtures (homeTeam,awayTeam,_date,status,matchday,goalsHomeTeam,goalsAwayTeam) VALUES(?,?,?,?,?,?,?)',tup)
		del tup
conn.commit()

cur.execute("SELECT * FROM Fixtures")
rows = cur.fetchall()

for row in rows:
    print (row)

cur.close()
