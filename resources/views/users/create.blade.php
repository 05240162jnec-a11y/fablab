<!DOCTYPE html>
<html>
<head>
    <title>Add User</title>
</head>
<body>

<h2>Add User</h2>

<form method="POST" action="/users/store">
    @csrf

    <label>Name:</label><br>
    <input type="text" name="name"><br><br>

    <label>Email:</label><br>
    <input type="email" name="email"><br><br>

    <label>Role:</label><br>
    <select name="role">
        <option value="student">Student</option>
        <option value="admin">Admin</option>
    </select><br><br>

    <label>Password:</label><br>
    <input type="password" name="password"><br><br>

    <button type="submit">Save</button>

</form>

</body>
</html>
