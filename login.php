<?php
session_start();
$db = new mysqli("localhost","root","amshamapple1995",'ffl');
if($db->connect_error)
{
     die('oops connection problem ! --> '.$db->connect_error);
}

if(isset($_SESSION['user']))
{
 header("Location: frontpage_new.html");
}
if(isset($_POST['UserName']) && isset($_POST['Password']))
{

 $uname = mysql_real_escape_string($_POST['UserName']);
 $upass = mysql_real_escape_string($_POST['Password']);
 $result=$db->query("SELECT * FROM userdetails WHERE UserName='$uname'");
 //$row=mysql_fetch_array($result);
 if($result->num_rows > 0){
	$row = $result->fetch_assoc();
	if($row['Password']==md5($upass))
 {
  $_SESSION['user'] = $row['UserName'];
  header("Location: `frontpage_new.html");
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