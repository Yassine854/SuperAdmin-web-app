<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SliderController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/register', [AuthController::class, 'register']);
Route::post('/CreateUser', [AuthController::class, 'CreateUser']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    //Roles
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles/create', [RoleController::class, 'create']);
    Route::put('/roles/update/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/delete/{id}', [RoleController::class, 'destroy']);

    //Admins
    Route::get('/admins', [AuthController::class, 'admins']);
    Route::put('/admins/update/{id}', [AuthController::class, 'updateAdmin']);
    Route::put('/admins/block/{id}', [AuthController::class, 'block']);
    Route::put('/admins/unblock/{id}', [AuthController::class, 'unblock']);

    //Clients
    Route::get('/user', [AuthController::class, 'user']);

    //Slider

    Route::get('/sliders/{admin_id}', [SliderController::class, 'index']);
    Route::post('/sliders/create/{admin_id}', [SliderController::class, 'create']);
    Route::put('/sliders/update/{admin_id}/{slider_id}', [SliderController::class, 'update']);
    Route::delete('/sliders/delete/{admin_id}/{slider_id}', [SliderController::class, 'destroy']);


    // Route::get('/clients', [AuthController::class, 'clients']);
});



Route::domain('{subdomain}.example.shop')->group(function () {
    Route::middleware(['auth:sanctum', 'subdomain'])->group(function () {
        Route::get('/clients', [AuthController::class, 'clients']);
    });
});
