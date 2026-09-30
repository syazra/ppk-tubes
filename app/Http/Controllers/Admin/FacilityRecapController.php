<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Services\FacilityRecap;
use App\Services\FacilityRecapWorkbook;
use Carbon\CarbonImmutable;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FacilityRecapController extends Controller
{
    public function index(Request $request, FacilityRecap $recap): Response
    {
        $filters = $this->filters($request);

        return Inertia::render('Admin/FacilityRecap', [
            'user' => $request->user()->only('name', 'email', 'role', 'account_type'),
            'csrfToken' => csrf_token(),
            'filters' => $filters,
            'locations' => Room::query()->distinct()->orderBy('location')->pluck('location'),
            'rooms' => Room::query()->orderBy('location')->orderBy('name')->get(['id', 'name', 'location']),
            'recap' => $recap->build($filters),
            'urls' => [
                'dashboard' => route('admin.dashboard'),
                'registrations' => route('admin.registrations.index'),
                'facilities' => route('admin.facilities.index'),
                'recap' => route('admin.facilities.recap'),
                'export' => route('admin.facilities.recap.export', ['format' => 'FORMAT']),
                'profile' => route('profile.edit'),
                'guest' => route('landing'),
                'logout' => route('logout'),
            ],
        ]);
    }

    public function export(Request $request, string $format, FacilityRecap $recap, FacilityRecapWorkbook $workbook): StreamedResponse|BinaryFileResponse|\Illuminate\Http\Response
    {
        abort_unless(in_array($format, ['csv', 'xlsx', 'pdf'], true), 404);

        $filters = $this->filters($request);
        $data = $recap->build($filters);
        $filename = "rekap-fasilitas-{$filters['from']}-{$filters['to']}.{$format}";

        if ($format === 'csv') {
            return response()->streamDownload(function () use ($data, $filters): void {
                $output = fopen('php://output', 'w');
                if ($output === false) {
                    throw new RuntimeException('Tidak dapat menulis berkas CSV.');
                }
                fwrite($output, "\xEF\xBB\xBF");
                fputcsv($output, ['Periode', $filters['from'].' s.d. '.$filters['to']]);
                fputcsv($output, ['Kriteria', 'Reservasi disetujui; laporan kerusakan baru/diproses/selesai']);
                fputcsv($output, []);
                fputcsv($output, ['Jenis', 'Fasilitas/Lokasi', 'Lokasi', 'Status', 'Jumlah Fasilitas', 'Reservasi Disetujui', 'Jam Terpakai', 'Laporan Kerusakan']);
                foreach ($data['facilities'] as $row) {
                    fputcsv($output, array_map($this->csvCell(...), ['Fasilitas', $row['name'], $row['location'], $row['is_avail'] ? 'Aktif' : 'Nonaktif', 1, $row['reservations'], $row['occupied_hours'], $row['damage_reports']]));
                }
                foreach ($data['locations'] as $row) {
                    fputcsv($output, array_map($this->csvCell(...), ['Lokasi', $row['location'], '', '', $row['facilities'], $row['reservations'], $row['occupied_hours'], $row['damage_reports']]));
                }
                fclose($output);
            }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
        }

        if ($format === 'xlsx') {
            return response()->download($workbook->create($data, $filters), $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend(true);
        }

        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'DejaVu Sans');
        $pdf = new Dompdf($options);
        $pdf->loadHtml(view('admin.facility-recap-pdf', compact('data', 'filters'))->render());
        $pdf->setPaper('a4', 'landscape');
        $pdf->render();

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
        ]);
    }

    /** @return array{from: string, to: string, location: string, room_id: int|string} */
    private function filters(Request $request): array
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
            'location' => ['nullable', 'string', 'max:100', Rule::exists('rooms', 'location')],
            'room_id' => ['nullable', 'integer', Rule::exists('rooms', 'id')],
        ]);

        $from = $validated['from'] ?? CarbonImmutable::now()->startOfMonth()->toDateString();
        $to = $validated['to'] ?? CarbonImmutable::now()->endOfMonth()->toDateString();

        if ($from > $to) {
            throw ValidationException::withMessages(['to' => 'Tanggal akhir harus sama dengan atau setelah tanggal awal.']);
        }

        return [
            'from' => $from,
            'to' => $to,
            'location' => $validated['location'] ?? '',
            'room_id' => $validated['room_id'] ?? '',
        ];
    }

    private function csvCell(mixed $value): string|int|float
    {
        if (! is_string($value)) {
            return $value;
        }

        return preg_match('/^[\s\x00-\x1F]*[=+\-@]/u', $value) ? "'".$value : $value;
    }
}
