<?php
session_start();
include_once 'db_connect.php';

if(isset($_SESSION['user'])!="")
{
 header("Location: home.php");
}
if(isset($_POST['login']))
{
	echo "Suck";
 $email = mysql_real_escape_string($_POST['UserName']);
 $upass = mysql_real_escape_string($_POST['Password']);
 $result=$db->query("SELECT * FROM userdetails WHERE UserName='$email'");
 //$row=mysql_fetch_array($result);
 if($result->num_rows > 0){
	$row = $result->fetch_assoc();
	if($row['Password']==md5($upass))
 {
  $_SESSION['user'] = $row['UserName'];
  echo "Sucessful";
  header("Location: member-index.php");
 }
 }
 
 else
 {
  ?>
        <script>alert('wrong details');</script>
        <?php
 }
 
}
?>