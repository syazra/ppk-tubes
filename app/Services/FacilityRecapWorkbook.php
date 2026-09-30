<?php

namespace App\Services;

use RuntimeException;
use ZipArchive;

class FacilityRecapWorkbook
{
    /**
     * @param array{
     *     facilities: array<int, array{id: int, name: string, location: string, type: string, is_avail: bool, reservations: int, occupied_hours: float, damage_reports: int}>,
     *     locations: array<int, array{location: string, facilities: int, reservations: int, occupied_hours: float, damage_reports: int}>,
     *     totals: array{facilities: int, reservations: int, occupied_hours: float, damage_reports: int}
     * } $data
     * @param  array{from: string, to: string, location: string, room_id: int|string}  $filters
     */
    public function create(array $data, array $filters): string
    {
        $path = tempnam(sys_get_temp_dir(), 'facility-recap-');
        if ($path === false) {
            throw new RuntimeException('Tidak dapat membuat berkas Excel.');
        }

        $zip = new ZipArchive;
        if ($zip->open($path, ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Tidak dapat menulis berkas Excel.');
        }

        $facilityRows = [
            ['Rekap fasilitas', $filters['from'].' s.d. '.$filters['to']],
            ['Reservasi disetujui; laporan kerusakan menunggu/disetujui'],
            [],
            ['Fasilitas', 'Lokasi', 'Jenis', 'Status', 'Reservasi Disetujui', 'Jam Terpakai', 'Laporan Kerusakan'],
        ];
        foreach ($data['facilities'] as $row) {
            $facilityRows[] = [$row['name'], $row['location'], $row['type'], $row['is_avail'] ? 'Aktif' : 'Nonaktif', $row['reservations'], $row['occupied_hours'], $row['damage_reports']];
        }

        $locationRows = [
            ['Rekap lokasi', $filters['from'].' s.d. '.$filters['to']],
            [],
            ['Lokasi', 'Jumlah Fasilitas', 'Reservasi Disetujui', 'Jam Terpakai', 'Laporan Kerusakan'],
        ];
        foreach ($data['locations'] as $row) {
            $locationRows[] = [$row['location'], $row['facilities'], $row['reservations'], $row['occupied_hours'], $row['damage_reports']];
        }

        $zip->addFromString('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
        $zip->addFromString('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
        $zip->addFromString('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Per Fasilitas" sheetId="1" r:id="rId1"/><sheet name="Per Lokasi" sheetId="2" r:id="rId2"/></sheets></workbook>');
        $zip->addFromString('xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>');
        $zip->addFromString('xl/worksheets/sheet1.xml', $this->sheet($facilityRows));
        $zip->addFromString('xl/worksheets/sheet2.xml', $this->sheet($locationRows));
        $zip->close();

        return $path;
    }

    /** @param array<int, array<int, string|int|float>> $rows */
    private function sheet(array $rows): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';

        foreach ($rows as $rowIndex => $row) {
            $xml .= '<row r="'.($rowIndex + 1).'">';
            foreach ($row as $columnIndex => $value) {
                $column = $this->column($columnIndex + 1);
                $reference = $column.($rowIndex + 1);
                if (is_int($value) || is_float($value)) {
                    $xml .= '<c r="'.$reference.'"><v>'.$value.'</v></c>';
                } else {
                    $xml .= '<c r="'.$reference.'" t="inlineStr"><is><t xml:space="preserve">'.$this->escape((string) $value).'</t></is></c>';
                }
            }
            $xml .= '</row>';
        }

        return $xml.'</sheetData></worksheet>';
    }

    private function column(int $index): string
    {
        $name = '';
        while ($index > 0) {
            $index--;
            $name = chr(65 + $index % 26).$name;
            $index = intdiv($index, 26);
        }

        return $name;
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
