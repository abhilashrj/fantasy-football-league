<?php
session_start();
if(isset($_SESSION['user'])!="")
{
 header("Location: home.php");
}
include_once 'db_connect.php';

if(isset($_POST['signup']))
{
 $uname = mysql_real_escape_string($_POST['username']);
 //$email = mysql_real_escape_string($_POST['email']);
 $upass = md5(mysql_real_escape_string($_POST['password']));
 $result = $db->query("INSERT INTO userdetails(UserName,Password) VALUES('$uname','$upass')");
 if($result==true)
 {
  ?>
        <script>alert('successfully registered ');</script>
        <?php
        header("Location: login_new.html");
 }
 else
 {
  ?>
        <script>alert('error while registering you...');</script>
        <?php
 }
}
$db->close();
?>