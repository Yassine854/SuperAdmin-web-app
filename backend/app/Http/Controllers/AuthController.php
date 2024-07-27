<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller {
    // register a new user method
    public function CreateUser(RegisterRequest $request) {

        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'password' => Hash::make($data['password']),
        ]);
        if ($user->role=="2"){
        $subdomain = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $data['name'])) . $user->id;
        $user->subdomain = $subdomain;
        $user->save();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $cookie = cookie('token', $token, 60 * 24); // 1 day

        return response()->json([
            'user' => $user,
        ])->withCookie($cookie);
    }



    public function register(RegisterRequest $request) {

        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
            'password' => Hash::make($data['password']),
        ]);
        $subdomain = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $data['name'])) . $user->id;
        $user->subdomain = $subdomain;
        $user->save();


        $token = $user->createToken('auth_token')->plainTextToken;

        $cookie = cookie('token', $token, 60 * 24, '/', env('SESSION_DOMAIN', '.example.shop'), true, true, false, 'None');

        // $domain = str_replace('://', '://' . $user->subdomain . '.', config('app.url'));
        // return redirect($domain)->withCookie($cookie)->with('user', new UserResource($user));
        return response()->json([
            'user' => new UserResource($user),
        ])->withCookie($cookie);
    }


    // login a user method
    public function login(LoginRequest $request) {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Email or password is incorrect!'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $cookie = cookie('token', $token, 60 * 24, '/', env('SESSION_DOMAIN', '.example.shop'), true, true, false, 'None');
        return response()->json([
            'user' => new UserResource($user),
        ])->withCookie($cookie);
    }

    // logout a user method
    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();

        $cookie = cookie()->forget('token');

        return response()->json([
            'message' => 'Logged out successfully!'
        ])->withCookie($cookie);
    }

    // get the authenticated user method
    public function user(Request $request) {
        return new UserResource($request->user());
    }

    public function admins() {
        $admins = User::where('role', "1")->get();

        return response()->json([
            'admins' => $admins
        ]);
    }


    public function clients() {
        $clients = User::where('role', "2")->get();
        return response()->json([
            'clients' => $clients
        ]);
    }

}
