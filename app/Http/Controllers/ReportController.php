<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Room; // Panggil model Room

class ReportController extends Controller
{
    public function form()
    {
        // Ambil semua data ruangan dari database
        $rooms = Room::all();
        
        // Kirim data ruangan ke view
        return view('reports.form', compact('rooms'));
    }
}
