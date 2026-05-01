<!DOCTYPE html>
<html>
<head>
    <title>Contact Page</title>
</head>
<body>

    <h1>Contact Form</h1>

    <form method="POST" action="/contact-submit">
        @csrf

        <label>Name:</label><br>
        <input type="text" name="name"><br><br>

        <label>Email:</label><br>
        <input type="email" name="email"><br><br>
        <label>Message:</label><br>
        <textarea name="message" rows="4" cols="40"></textarea><br><br>

        <button type="submit">Submit</button>
    </form>

</body>
</html>
