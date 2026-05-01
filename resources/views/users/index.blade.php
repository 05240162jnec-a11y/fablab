<!DOCTYPE html>
<html>
<head>
    <title>Users List</title>
</head>
<body>

<h2>Users</h2>

<table border="1">
    <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
    </tr>

    @foreach ($users as $user)
    <tr>
        <td>{{ $user->id }}</td>
        <td>{{ $user->name }}</td>
        <td>{{ $user->email }}</td>
        <td>{{ $user->role }}</td>
    </tr>
    @endforeach
</table>

</body>
</html>
