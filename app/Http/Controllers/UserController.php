<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function create()
{
    $user = new User();
    $user->name = "Ugyen";
    $user->email = "ugyen@example.com";
    $user->role = "student";
    $user->password = bcrypt("password123");
    $user->save();

    return "User created successfully";
}

public function read()
{
    $users = User::all();
    return $users;
}

public function update()
{
    $user = User::find(1); // user with ID = 1
    $user->name = "Updated Name";
    $user->save();

    return "User updated successfully";
}

public function delete()
{
    $user = User::find(1);
    $user->delete();

    return "User deleted successfully";
}

public function createForm()
{
    return view('users.create');
}
public function store(Request $request)
{
    $user = new User();
    $user->name = $request->name;
    $user->email = $request->email;
    $user->role = $request->role;
    $user->password = bcrypt($request->password);
    $user->save();

    return redirect('/users');
}
public function index()
{
    $users = User::all();
    return view('users.index', compact('users'));
}

}
