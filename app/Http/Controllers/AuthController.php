public function register(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name'         => 'required|string|max:255',
        'email'        => 'required|string|email|max:255|unique:users',
        'password'     => 'required|string|min:8',
        'cid'          => 'nullable|string',
        'gender'       => 'nullable|string',
        'phone'        => 'nullable|string',
        'account_type' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'errors' => $validator->errors()
        ], 422);
    }

    $role = $this->detectRole($request->email);

    $user = User::create([
        'name'         => $request->name,
        'email'        => $request->email,
        'password'     => Hash::make($request->password),
        'role'         => $role,
        'cid'          => $request->cid,
        'gender'       => $request->gender,
        'phone'        => $request->phone,
        'account_type' => $request->account_type,
    ]);

    // Create token after registration
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Registration successful!',
        'token'   => $token,
        'user'    => $user,
        'role'    => $role,
    ], 201);
}