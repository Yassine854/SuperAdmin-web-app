<?php

namespace App\Http\Controllers;

use App\Models\Slider;
use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SliderController extends Controller
{

    public function index($admin_id)
{
    $sliders = Slider::where('user_id', $admin_id)->get();

    $admin = User::where('_id', $admin_id)->first();

    return response()->json([
        'sliders' => $sliders,
        'admin' => $admin
    ]);
}


    public function create(Request $request,$admin_id)
    {

        $request->validate([
            'image' => 'required',
            'title' => 'string|max:255',
            'description' => 'string|max:255',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $timestamp = now()->timestamp;
            $filename = $timestamp . '.' . $file->getClientOriginalExtension();
            $imagePath = $file->storeAs('sliders', $filename, 'public');
        } else {
            return response()->json(['error' => 'Image is required'], 400);
        }

        $slider = Slider::create([
            'image' => $imagePath,
            'title' => $request->input('title'),
            'user_id' => $admin_id,
            'description' => $request->input('description'),
        ]);
        return response()->json($slider, 201);

    }


    public function update(Request $request,$slider_id)
    {
        $request->validate([
            'image' => 'required|string|max:255',
        ]);

        $slider = Slider::findOrFail($slider_id);
        $slider->name = $request->input('image');
        $slider->save();

        return response()->json($slider);
    }

    public function destroy(Slider $slider)
    {
        $slider->delete();
        return response()->json(null, 204);
    }

}
