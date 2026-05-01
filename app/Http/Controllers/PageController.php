<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PageController extends Controller
{
    public function hello()
    {
        return view('hello');
    }

    public function about()
    {
        return view('about');
    }

    public function contact()
    {
        return view('contact');
    }
    
    public function contactSubmit(Request $request)
{
    $name = $request->name;
    $email = $request->email;
    $message = $request->message;

    return "
        <h2>Form Submitted Successfully</h2>
        <p><strong>Name:</strong> $name</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Message:</strong> $message</p>
    ";
}


}

