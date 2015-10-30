<?php
$db = new mysqli("localhost","root","",'ffl');
if($db->connect_error)
{
     die('oops connection problem ! --> '.$db->connect_error);
}
// if(!mysql_select_db("ffl"))
// {
//      die('oops database selection problem ! --> '.mysql_error());
// }
?>