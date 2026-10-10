<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use LogicException;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new LogicException('Demo accounts may only be seeded in local or testing environments.');
        }

        $users = [
            [
                'id' => 1,
                'name' => 'Dr. Aris Puji Widodo, S.Si., M.T.',
                'email' => 'arispujiw@admin.kampus.ac.id',
                'role' => 'admin',
                'account_type' => 'admin', 
                'identity_number' => '197404011999031002',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Annisa Istiadah N., A.Md',
                'email' => 'annisaisti@operator.kampus.ac.id',
                'role' => 'operator',
                'account_type' => 'petugas',
                'identity_number' => '198911012023102001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Anang Ardiyanto, S.Kom.',
                'email' => 'anangardiyanto@operator.kampus.ac.id',
                'role' => 'operator',
                'account_type' => 'petugas',
                'identity_number' => '199406052023101001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Ruth Septriana Sipangkar',
                'email' => 'ruthseptriana@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124120024',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Syafira Azka Ramadhani',
                'email' => 'syafirazka@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124130088',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 6,
                'name' => 'Yasmina Syahidah',
                'email' => 'yasminasya@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124130116',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 7,
                'name' => 'Muhammad Farhan Abdul Azis',
                'email' => 'mfarhanabdul@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140166',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 8,
                'name' => 'Sandy Kurniawan, S.Kom., M.Kom.',
                'email' => 'sandykurniawan@lecturer.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'dosen',
                'identity_number' => '199603032024061003',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 9,
                'name' => 'Henri Tantyoko, S.Kom., M.Kom.',
                'email' => 'henritantyoko@lecturer.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'dosen',
                'identity_number' => '199612272024061001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 10,
                'name' => 'Beny Nugroho, S.Kom.',
                'email' => 'benynugroho@staff.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'staf',
                'identity_number' => '198611152023101001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],


            [
                'id' => 11,
                'name' => 'Harry Potter',
                'email' => 'harrypotter@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140167',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 12,
                'name' => 'Hermione Granger',
                'email' => 'hermionegranger@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140168',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 13,
                'name' => 'Ron Weasley',
                'email' => 'ronweasley@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140169',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 14,
                'name' => 'Ginny Weasley',
                'email' => 'ginnyweasley@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140170',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 15,
                'name' => 'Fred Weasley',
                'email' => 'fredweasley@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140171',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 16,
                'name' => 'George Weasley',
                'email' => 'georgeweasley@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140172',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 17,
                'name' => 'Percy Weasley',
                'email' => 'percyweasley@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140173',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 18,
                'name' => 'Bill Weasley',
                'email' => 'billweasley@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140174',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 19,
                'name' => 'Charlie Weasley',
                'email' => 'charlieweasley@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140175',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 20,
                'name' => 'Arthur Weasley',
                'email' => 'arthurweasley@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140176',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 21,
                'name' => 'Feanor',
                'email' => 'feanor@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140177',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 22,
                'name' => 'Fingolfin',
                'email' => 'fingolfin@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140178',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 23,
                'name' => 'Finarfin',
                'email' => 'finarfin@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140179',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 24,
                'name' => 'Finrod Felagund',
                'email' => 'finrodfelagund@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140180',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 25,
                'name' => 'Fingon',
                'email' => 'fingon@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140181',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 26,
                'name' => 'Turgon',
                'email' => 'turgon@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140182',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 27,
                'name' => 'Maedhros',
                'email' => 'maedhros@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140183',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 28,
                'name' => 'Maglor',
                'email' => 'maglor@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140184',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 29,
                'name' => 'Celegorm',
                'email' => 'celegorm@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140185',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 30,
                'name' => 'Caranthir',
                'email' => 'caranthir@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140186',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],

        ];

        // Additional mahasiswa (ids 31+), themed on Tolkien's Legendarium and A Song of Ice and Fire.
        $password = Hash::make('password');
        $nextId = 31;
        $nextIdentity = 24060124140187;
        foreach ($this->mahasiswaNames() as $name) {
            $users[] = [
                'id' => $nextId++,
                'name' => $name,
                'email' => preg_replace('/[^a-z0-9]/', '', strtolower($name)).'@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => (string) $nextIdentity++,
                'password' => $password,
                'email_verified_at' => now(),
            ];
        }

        // Themed dosen (ids 281-290) and staf (ids 291-300).
        $nextId = 281;
        $staffRoster = [
            ['dosen', 'lecturer', '1975', $this->dosenNames()],
            ['staf', 'staff', '1988', $this->stafNames()],
        ];
        foreach ($staffRoster as [$type, $domain, $birthYear, $names]) {
            foreach ($names as $n => $name) {
                $users[] = [
                    'id' => $nextId++,
                    'name' => $name,
                    'email' => preg_replace('/[^a-z0-9]/', '', strtolower(preg_replace('/,.*$/', '', $name))).'@'.$domain.'.kampus.ac.id',
                    'role' => 'user',
                    'account_type' => $type,
                    'identity_number' => $birthYear.sprintf('%02d', $n + 1).'012020'.($type === 'dosen' ? '01' : '02').sprintf('%04d', $n + 1),
                    'password' => $password,
                    'email_verified_at' => now(),
                ];
            }
        }

        foreach ($users as $user) {
            User::updateOrCreate(
                ['id' => $user['id']],
                $user
            );
        }
    }

    /**
     * @return list<string>
     */
    private function dosenNames(): array
    {
        return [
            'Prof. Gandalf Mithrandir, S.Si., M.T.',
            'Dr. Elrond Halfelven, M.Kom.',
            'Dr. Galadriel Artanis, S.Kom., M.Sc.',
            'Dr. Saruman Curunir, M.T.',
            'Maester Aemon Targaryen, S.Si., M.Sc.',
            'Dr. Luthien Tinuviel, S.Kom., M.Kom.',
            'Dr. Tyrion Lannister, S.T., M.Eng.',
            'Prof. Cirdan Shipwright, Ph.D.',
            'Maester Pycelle Citadel, S.Kom., M.T.',
            'Dr. Melian Maia, S.Si., M.Kom.',
        ];
    }

    /**
     * @return list<string>
     */
    private function stafNames(): array
    {
        return [
            'Samwise Gamgee, A.Md.',
            'Bilbo Baggins, S.Kom.',
            'Hodor Stableborn, A.Md.',
            'Podrick Payne, S.Kom.',
            'Treebeard Fangorn, S.Si.',
            'Gimli Gloin, A.Md.',
            'Gendry Waters, A.Md.',
            'Rosie Cotton, S.Kom.',
            'Beregond Minas, A.Md.',
            'Brienne Tarth, S.Kom.',
        ];
    }

    /**
     * 100 original (non-canon) names in Legendarium / Westeros style. Pairs are unique by
     * construction: within a block of 25 the given name differs, across blocks the house shifts.
     *
     * @return list<string>
     */
    private function genericMahasiswaNames(): array
    {
        $first = [
            'Aerwen', 'Belegon', 'Calenor', 'Daeron', 'Elenwe', 'Faelivrin', 'Galathil', 'Haldan', 'Ithilwen', 'Jorlan',
            'Kaelen', 'Lothwen', 'Marwen', 'Narvian', 'Orophin', 'Brynden', 'Cassana', 'Aemon', 'Rhaenys', 'Talisa',
            'Ulmo', 'Vaelor', 'Wulfric', 'Yarwen', 'Edrick',
        ];
        $last = [
            'Greenvale', 'Stonehelm', 'Ravenmoor', 'Brightwater', 'Oakenfist',
            'Silverbrook', 'Frostmere', 'Goldenleaf', 'Ironwood', 'Dawnstrider',
        ];

        $names = [];
        for ($i = 0; $i < 100; $i++) {
            $names[] = $first[$i % 25].' '.$last[($i * 3 + intdiv($i, 25)) % 10];
        }

        return $names;
    }

    /**
     * @return list<string>
     */
    private function mahasiswaNames(): array
    {
        return array_merge($this->themedMahasiswaNames(), $this->genericMahasiswaNames());
    }

    /**
     * @return list<string>
     */
    private function themedMahasiswaNames(): array
    {
        return [
            // Legendarium: Fellowship, Rohan, Gondor, Shire
            'Frodo Baggins', 'Samwise Gamgee', 'Meriadoc Brandybuck', 'Peregrin Took', 'Gandalf Grey',
            'Aragorn Elessar', 'Legolas Greenleaf', 'Gimli Gloin', 'Boromir Denethor', 'Faramir Denethor',
            'Eowyn Eomund', 'Eomer Eomund', 'Theoden Thengel', 'Theodred Theoden', 'Grima Wormtongue',
            'Bilbo Baggins', 'Rosie Cotton', 'Elanor Gamgee', 'Fatty Bolger', 'Lobelia Sackville',
            'Galadriel Finarfin', 'Celeborn Doriath', 'Elrond Peredhel', 'Arwen Undomiel', 'Elladan Elrondion',
            'Elrohir Elrondion', 'Glorfindel Gondolin', 'Haldir Lorien', 'Thranduil Greenwood', 'Tauriel Mirkwood',
            'Gollum Smeagol', 'Radagast Brown', 'Saruman Curunir', 'Treebeard Fangorn', 'Tom Bombadil',
            'Goldberry Riverdaughter', 'Beregond Minas', 'Imrahil Dol Amroth', 'Denethor Ecthelion', 'Halbarad Dunedain',
            // Silmarillion
            'Luthien Tinuviel', 'Beren Erchamion', 'Turin Turambar', 'Tuor Huor', 'Earendil Mariner',
            'Elwing Dior', 'Idril Celebrindal', 'Eol Dark Elf', 'Aredhel Ar-Feiniel', 'Maeglin Lomion',
            'Thingol Elwe', 'Melian Maia', 'Morwen Eledhwen', 'Nienor Niniel', 'Hurin Thalion',
            'Huor Galdor', 'Finduilas Orodreth', 'Orodreth Angrod', 'Angrod Finarfin', 'Aegnor Finarfin',
            'Gwindor Nargothrond', 'Beleg Cuthalion', 'Elmo Doriath', 'Galdor Tall', 'Amrod Feanorian',
            'Amras Feanorian', 'Curufin Fëanorion', 'Nerdanel Mahtan', 'Miriel Serindë', 'Olwe Alqualonde',
            'Cirdan Shipwright', 'Gil-galad Fingon', 'Elendil Faithful', 'Isildur Elendil', 'Anarion Elendil',
            'Numenor Elros', 'Elros Tar-Minyatur', 'Ar-Pharazon Golden', 'Tar-Miriel Numenor', 'Eonwe Herald',
            // A Song of Ice and Fire / Game of Thrones
            'Eddard Stark', 'Catelyn Tully', 'Robb Stark', 'Sansa Stark', 'Arya Stark',
            'Bran Stark', 'Rickon Stark', 'Jon Snow', 'Benjen Stark', 'Lyanna Stark',
            'Tyrion Lannister', 'Cersei Lannister', 'Jaime Lannister', 'Tywin Lannister', 'Joffrey Baratheon',
            'Myrcella Baratheon', 'Tommen Baratheon', 'Lancel Lannister', 'Kevan Lannister', 'Robert Baratheon',
            'Stannis Baratheon', 'Renly Baratheon', 'Shireen Baratheon', 'Davos Seaworth', 'Melisandre Asshai',
            'Daenerys Targaryen', 'Viserys Targaryen', 'Rhaegar Targaryen', 'Aegon Targaryen', 'Jorah Mormont',
            'Missandei Naath', 'Grey Worm', 'Daario Naharis', 'Barristan Selmy', 'Khal Drogo',
            'Petyr Baelish', 'Varys Spider', 'Sandor Clegane', 'Gregor Clegane', 'Brienne Tarth',
            'Podrick Payne', 'Bronn Blackwater', 'Margaery Tyrell', 'Loras Tyrell', 'Olenna Tyrell',
            'Oberyn Martell', 'Ellaria Sand', 'Doran Martell', 'Theon Greyjoy', 'Yara Greyjoy',
            'Euron Greyjoy', 'Balon Greyjoy', 'Samwell Tarly', 'Gilly Craster', 'Tormund Giantsbane',
            'Ygritte Wildling', 'Mance Rayder', 'Jeor Mormont', 'Roose Bolton', 'Ramsay Snow',
            'Walder Frey', 'Hodor Stable', 'Osha Wildling', 'Meera Reed', 'Jojen Reed',
            'Lysa Arryn', 'Robin Arryn', 'Jaqen Hghar', 'Gendry Waters', 'Edmure Tully',
        ];
    }
}
