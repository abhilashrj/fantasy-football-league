<?php

$db = new mysqli("localhost","root","",'ffl');

$sql = "SELECT UserName from userdetails where UserName=$_POST['Username']";

$result = $db->query ($sql);

if($result->num_rows>0)
{
	echo 0;
}
else 
{
    echo 1;
}

?>
