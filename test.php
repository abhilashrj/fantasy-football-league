<!DOCTYPE html>

<html>
<head>
</head>
<body>

<?php
	//echo "YEs";

	$pos = $_GET['pos'];
	$lid = intval($_GET['lid']);
	$page = intval($_GET['page']);
	$sortBy = $_GET['sortBy'];
	$lim = ($page-1)*15;
	// echo "$pos<br />";
	echo "Shit";
	echo $pos." ".$lid." ".$page." ".$sortBy;
	$conn = new mysqli('localhost','root','amshamapple1995','ffl');

	if ($conn->connect_error)
	{
		die("unable to connect to mysql server" . $conn->connect_error);
	}

	
	$sql = "SELECT p.Name,p.Player_ID,t.Code,p.MarketValue AS Price,SUM(per.Attack_pts) + SUM(per.Passing_pts) + SUM(per.Defence_pts) AS Points FROM Player AS p INNER JOIN Team AS t ON t.Team_ID=p.Team_ID INNER JOIN Performance per ON p.Player_ID=per.Player_ID INNER JOIN Fixtures f ON per.Fixture_ID=f.Fixture_ID WHERE f.FixtureDate < NOW() AND t.League_ID=$lid AND p.Position='$pos' GROUP BY p.Player_ID ORDER BY $sortBy DESC LIMIT $lim,15";
	$result = $conn->query ($sql);

	// var_dump($result);

	if ($result->num_rows > 0)
	{

		echo '<table id="ismElementDataTable" class="ismTable ismPlayerList" style="display: table;">';
		echo '<tbody>';
		echo "<tr>";
		echo '<th colspan="2">'.$pos.'</th>';
		echo "<th>$</th>";
		echo "<th>pts</th>";
		echo "</tr>";
		while ($row = $result ->fetch_assoc())
		{
			echo "<tr>";
			echo '<td><a onclick="playerFetch('."'".$pos."'".",'".$row['Name']."'".",'".$row['Price']."'".')" href="#">'.$row['Name']."</a></td>";
			echo "<td>".$row['Code']."</td>";
			echo "<td>".$row['Price']."</td>";
			echo "<td>".$row['Points']."</td>";
			echo "</tr>";
		}
		echo '</tbody>';

	}
		// echo "no results";

	$conn->close();

	// $file = 'log.txt';
	// file_put_contents($file, "Done execution");
?>
</body>

</html>