// database/seeds/incidents-dummy-seed.ts
// 30 data dummy kejadian bencana Kalimantan Timur
// Jalankan: bun run database/seeds/incidents-dummy-seed.ts

import { db } from '@/lib/db'
import {
  incidents,
  incidentVictims,
  incidentDamages,
  disasterTypes,
  disasterCauses,
} from '@db/schema'

async function seed() {
  // Ambil ID disasterTypes dan disasterCauses dari DB
  const types = await db.select().from(disasterTypes)
  const causes = await db.select().from(disasterCauses)

  const typeId = (name: string) => types.find((t) => t.name === name)?.id ?? types[0]?.id ?? 1
  const causeId = (name: string) => causes.find((c) => c.name === name)?.id

  // ── 30 Insiden dummy ───────────────────────────────────────
  const dummyIncidents = [
    // ── Samarinda ──────────────────────────────────────────────
    {
      title: 'Kebakaran Pemukiman Padat Penduduk Loa Bakung',
      disasterTypeId: typeId('Kebakaran'),
      causeId: causeId('Konsleting Listrik'),
      description:
        'Kebakaran terjadi pada dini hari sekitar pukul 02.30 WITA menghanguskan 5 unit rumah warga di RT 12 Kelurahan Loa Bakung. Api pertama kali terlihat dari rumah milik warga dan cepat menjalar ke rumah sekitar.',
      source: 'BPBD Kota Samarinda',
      occurredDate: new Date('2026-01-08'),
      occurredTime: '02:30:00',
      regencyId: '6471',
      districtId: '647107',
      villageName: 'Loa Bakung',
      addressDetail: 'RT 12',
      latitude: '-0.4812',
      longitude: '117.0734',
      status: 'selesai' as const,
      currentCondition: 'Sudah Padam',
      currentEffort: 'Asesmen kerusakan dan pendataan korban terdampak',
      isPublished: true,
      victims: [
        {
          impactType: 'menderita' as const,
          ageGroup: 'dewasa' as const,
          countMale: 8,
          countFemale: 7,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'anak' as const,
          countMale: 3,
          countFemale: 2,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 3,
          moderateDamage: 2,
          lightDamage: 0,
          estimatedLoss: 450000000,
        },
      ],
    },
    {
      title: 'Banjir Genangan Kawasan Sempaja Selatan',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Hujan deras selama 4 jam mengakibatkan genangan setinggi 50-80 cm di sejumlah titik Kelurahan Sempaja Selatan. Beberapa ruas jalan tidak bisa dilalui kendaraan.',
      source: 'BPBD Kota Samarinda',
      occurredDate: new Date('2026-02-15'),
      occurredTime: '16:00:00',
      regencyId: '6471',
      districtId: '647109',
      villageName: 'Sempaja Selatan',
      latitude: '-0.4102',
      longitude: '117.1521',
      status: 'selesai' as const,
      currentCondition: 'Sudah Surut',
      currentEffort: 'Koordinasi dengan Dinas PUPR untuk normalisasi drainase',
      isPublished: true,
      victims: [
        {
          impactType: 'menderita' as const,
          ageGroup: 'dewasa' as const,
          countMale: 45,
          countFemale: 42,
        },
      ],
      damages: [
        {
          assetName: 'Jalan',
          heavyDamage: 0,
          moderateDamage: 1,
          lightDamage: 3,
          estimatedLoss: 75000000,
        },
      ],
    },
    {
      title: 'Tanah Longsor Bukit Pinang Akibat Hujan Deras',
      disasterTypeId: typeId('Tanah Longsor'),
      causeId: causeId('Hujan Sedang - Lebat & Angin Kencang'),
      description:
        'Longsor menimpa 2 unit rumah di lereng bukit Kelurahan Bukit Pinang. Material tanah menutup jalan setapak warga.',
      source: 'Laporan Warga / BPBD Samarinda',
      occurredDate: new Date('2026-02-28'),
      occurredTime: '20:15:00',
      regencyId: '6471',
      districtId: '647108',
      villageName: 'Bukit Pinang',
      latitude: '-0.4845',
      longitude: '117.1421',
      status: 'selesai' as const,
      currentCondition: 'Tidak Ada Korban Jiwa',
      currentEffort: 'Pembersihan material longsor dan pengecekan struktur rumah terdampak',
      isPublished: true,
      victims: [
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 4,
          countFemale: 5,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 1,
          moderateDamage: 1,
          lightDamage: 0,
          estimatedLoss: 120000000,
        },
      ],
    },
    {
      title: 'Kebakaran Gudang Material Kawasan Loa Buah',
      disasterTypeId: typeId('Kebakaran'),
      causeId: causeId('Dalam Penyelidikan'),
      description:
        'Gudang penyimpanan material bangunan terbakar dan menghanguskan seluruh isi gudang. Tidak ada korban jiwa karena kejadian terjadi malam hari saat gudang kosong.',
      source: 'Disdamkar Kota Samarinda',
      occurredDate: new Date('2026-03-10'),
      occurredTime: '23:45:00',
      regencyId: '6471',
      districtId: '647107',
      villageName: 'Loa Buah',
      latitude: '-0.4903',
      longitude: '117.0801',
      status: 'selesai' as const,
      currentCondition: 'Sudah Padam',
      currentEffort: 'Penyelidikan penyebab kebakaran oleh kepolisian',
      isPublished: true,
      victims: [],
      damages: [
        {
          assetName: 'Fasilitas Umum',
          heavyDamage: 1,
          moderateDamage: 0,
          lightDamage: 0,
          estimatedLoss: 800000000,
        },
      ],
    },
    {
      title: 'Cuaca Ekstrem Angin Kencang Samarinda Utara',
      disasterTypeId: typeId('Cuaca Ekstrem'),
      causeId: causeId('Angin Kencang'),
      description:
        'Angin kencang merobohkan sejumlah pohon dan merusak atap rumah warga di Kelurahan Tanah Merah dan sekitarnya.',
      source: 'BMKG Stasiun Samarinda',
      occurredDate: new Date('2026-04-02'),
      occurredTime: '14:30:00',
      regencyId: '6471',
      districtId: '647109',
      villageName: 'Tanah Merah',
      latitude: '-0.3844',
      longitude: '117.1632',
      status: 'selesai' as const,
      currentCondition: 'Tidak Ada Laporan Kerusakan',
      currentEffort: 'Pembersihan pohon tumbang dan perbaikan atap',
      isPublished: true,
      victims: [],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 0,
          moderateDamage: 3,
          lightDamage: 8,
          estimatedLoss: 45000000,
        },
      ],
    },
    {
      title: 'Banjir Kawasan Pasar Pagi Samarinda Kota',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Luapan Sungai Karang Mumus menggenangi kawasan Pasar Pagi setinggi 60-100 cm. Aktivitas pedagang terhenti dan beberapa kios terendam.',
      source: 'BPBD Kota Samarinda',
      occurredDate: new Date('2026-04-20'),
      occurredTime: '08:00:00',
      regencyId: '6471',
      districtId: '647103',
      villageName: 'Pasar Pagi',
      latitude: '-0.5017',
      longitude: '117.1511',
      status: 'ditangani' as const,
      currentCondition: 'Dalam Penanganan',
      currentEffort: 'Pompa air dioperasikan, koordinasi normalisasi sungai',
      isPublished: true,
      victims: [
        {
          impactType: 'menderita' as const,
          ageGroup: 'dewasa' as const,
          countMale: 30,
          countFemale: 28,
        },
      ],
      damages: [
        {
          assetName: 'Fasilitas Umum',
          heavyDamage: 0,
          moderateDamage: 0,
          lightDamage: 5,
          estimatedLoss: 35000000,
        },
      ],
    },

    // ── Balikpapan ─────────────────────────────────────────────
    {
      title: 'Kebakaran Pemukiman Margasari Balikpapan Barat',
      disasterTypeId: typeId('Kebakaran'),
      causeId: causeId('Kompor Terbakar'),
      description:
        'Kebakaran berawal dari kompor gas yang meledak di dapur rumah warga. Api menjalar ke 3 rumah tetangga yang berdekatan.',
      source: 'Disdamkar Kota Balikpapan',
      occurredDate: new Date('2026-01-22'),
      occurredTime: '11:30:00',
      regencyId: '6472',
      districtId: '647203',
      villageName: 'Margasari',
      addressDetail: 'RT 05',
      latitude: '-1.2612',
      longitude: '116.8012',
      status: 'selesai' as const,
      currentCondition: 'Sudah Padam',
      currentEffort: 'Pendataan dan bantuan darurat korban kebakaran',
      isPublished: true,
      victims: [
        {
          impactType: 'meninggal' as const,
          ageGroup: 'lansia' as const,
          countMale: 1,
          countFemale: 0,
        },
        {
          impactType: 'luka_sakit' as const,
          ageGroup: 'dewasa' as const,
          countMale: 2,
          countFemale: 1,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'anak' as const,
          countMale: 4,
          countFemale: 3,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 2,
          moderateDamage: 1,
          lightDamage: 1,
          estimatedLoss: 320000000,
        },
      ],
    },
    {
      title: 'Banjir Sepinggan Balikpapan Selatan',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat & Angin Kencang'),
      description:
        'Hujan lebat selama 6 jam mengakibatkan banjir di kawasan perumahan Sepinggan. Ketinggian air mencapai 70 cm di titik terendah.',
      source: 'BPBD Kota Balikpapan',
      occurredDate: new Date('2026-02-05'),
      occurredTime: '18:00:00',
      regencyId: '6472',
      districtId: '647201',
      villageName: 'Sepinggan',
      latitude: '-1.2754',
      longitude: '116.9021',
      status: 'selesai' as const,
      currentCondition: 'Sudah Surut',
      currentEffort: 'Evakuasi warga dan pembersihan pasca banjir',
      isPublished: true,
      victims: [
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 25,
          countFemale: 22,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'anak' as const,
          countMale: 12,
          countFemale: 10,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 0,
          moderateDamage: 2,
          lightDamage: 15,
          estimatedLoss: 85000000,
        },
      ],
    },
    {
      title: 'Longsor Tebing Karang Joang Balikpapan Utara',
      disasterTypeId: typeId('Tanah Longsor'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Longsor tebing setinggi 8 meter menimpa jalan akses menuju Kelurahan Karang Joang. Material tanah menutup ruas jalan sepanjang 50 meter.',
      source: 'Dinas PU Balikpapan',
      occurredDate: new Date('2026-03-18'),
      occurredTime: '06:45:00',
      regencyId: '6472',
      districtId: '647204',
      villageName: 'Karang Joang',
      latitude: '-1.1845',
      longitude: '116.8934',
      status: 'selesai' as const,
      currentCondition: 'Tidak Ada Korban Jiwa',
      currentEffort: 'Pembersihan material longsor menggunakan alat berat',
      isPublished: true,
      victims: [],
      damages: [
        {
          assetName: 'Jalan',
          heavyDamage: 1,
          moderateDamage: 0,
          lightDamage: 0,
          estimatedLoss: 200000000,
        },
      ],
    },
    {
      title: 'Kebakaran Hutan Kariangau Balikpapan Barat',
      disasterTypeId: typeId('Karhutla'),
      causeId: causeId('Pembakaran Lahan'),
      description:
        'Karhutla melanda lahan seluas ±15 hektar di kawasan Kariangau. Api berhasil dipadamkan setelah 2 hari penanganan oleh tim gabungan.',
      source: 'BPBD Kota Balikpapan / Manggala Agni',
      occurredDate: new Date('2026-04-10'),
      occurredTime: '13:00:00',
      regencyId: '6472',
      districtId: '647203',
      villageName: 'Kariangau',
      latitude: '-1.2012',
      longitude: '116.7834',
      status: 'selesai' as const,
      currentCondition: 'Sudah Padam',
      currentEffort: 'Pemadaman oleh tim Manggala Agni dan BPBD dibantu water bombing',
      isPublished: true,
      victims: [],
      damages: [
        {
          assetName: 'Lahan/Sawah',
          heavyDamage: 15,
          moderateDamage: 0,
          lightDamage: 0,
          estimatedLoss: 150000000,
        },
      ],
    },
    {
      title: 'Cuaca Ekstrem Gelombang Tinggi Manggar',
      disasterTypeId: typeId('Gelombang Tinggi/Abrasi'),
      causeId: causeId('Angin Kencang'),
      description:
        'Gelombang tinggi mencapai 2-3 meter menghantam pesisir Manggar. Beberapa perahu nelayan rusak dan aktivitas melaut dihentikan sementara.',
      source: 'BMKG Balikpapan',
      occurredDate: new Date('2026-05-01'),
      occurredTime: '09:00:00',
      regencyId: '6472',
      districtId: '647202',
      villageName: 'Manggar',
      latitude: '-1.2341',
      longitude: '116.9812',
      status: 'ditangani' as const,
      currentCondition: 'Dalam Penanganan',
      currentEffort: 'Imbauan nelayan tidak melaut, bantuan perbaikan perahu',
      isPublished: true,
      victims: [],
      damages: [
        {
          assetName: 'Fasilitas Umum',
          heavyDamage: 0,
          moderateDamage: 2,
          lightDamage: 5,
          estimatedLoss: 95000000,
        },
      ],
    },

    // ── Kutai Kartanegara ──────────────────────────────────────
    {
      title: 'Banjir Luapan Sungai Mahakam Tenggarong',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Sungai Mahakam meluap menggenangi permukiman warga di pesisir Tenggarong. Ketinggian air bervariasi antara 1-1,5 meter di titik terdampak terparah.',
      source: 'BPBD Kutai Kartanegara',
      occurredDate: new Date('2026-01-15'),
      occurredTime: '05:00:00',
      regencyId: '6403',
      districtId: '640308',
      villageName: 'Melayu',
      latitude: '-0.4334',
      longitude: '117.0012',
      status: 'selesai' as const,
      currentCondition: 'Sudah Surut',
      currentEffort: 'Evakuasi 250 KK ke posko pengungsian, distribusi logistik',
      isPublished: true,
      victims: [
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 312,
          countFemale: 298,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'anak' as const,
          countMale: 145,
          countFemale: 132,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'lansia' as const,
          countMale: 45,
          countFemale: 52,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 5,
          moderateDamage: 32,
          lightDamage: 87,
          estimatedLoss: 1250000000,
        },
        {
          assetName: 'Jalan',
          heavyDamage: 0,
          moderateDamage: 2,
          lightDamage: 4,
          estimatedLoss: 180000000,
        },
      ],
    },
    {
      title: 'Kebakaran Lahan Gambut Loa Janan Kutai Kartanegara',
      disasterTypeId: typeId('Karhutla'),
      causeId: causeId('Pembakaran Lahan'),
      description:
        'Kebakaran lahan gambut seluas ±45 hektar di Kecamatan Loa Janan. Asap tebal mengganggu jarak pandang dan kualitas udara warga sekitar.',
      source: 'BPBD Kutai Kartanegara / Satgas Karhutla',
      occurredDate: new Date('2026-03-25'),
      occurredTime: '10:00:00',
      regencyId: '6403',
      districtId: '640304',
      villageName: 'Bakungan',
      latitude: '-0.5812',
      longitude: '117.0234',
      status: 'selesai' as const,
      currentCondition: 'Sudah Padam',
      currentEffort: 'Pemadaman dengan water bombing BNPB selama 3 hari',
      isPublished: true,
      victims: [],
      damages: [
        {
          assetName: 'Lahan/Sawah',
          heavyDamage: 45,
          moderateDamage: 0,
          lightDamage: 0,
          estimatedLoss: 450000000,
        },
      ],
    },
    {
      title: 'Gempa Bumi M4.2 Terasa di Kutai Kartanegara',
      disasterTypeId: typeId('Gempa Bumi'),
      causeId: causeId('Gempa Tektonik'),
      description:
        'Gempa berkekuatan M4.2 terasa di wilayah Kutai Kartanegara dengan kedalaman 10 km. Warga sempat panik dan keluar rumah namun tidak ada kerusakan signifikan.',
      source: 'BMKG',
      occurredDate: new Date('2026-04-05'),
      occurredTime: '07:23:00',
      regencyId: '6403',
      districtId: '640308',
      villageName: 'Timbau',
      latitude: '-0.4512',
      longitude: '117.0145',
      status: 'selesai' as const,
      currentCondition: 'Tidak Ada Laporan Kerusakan',
      currentEffort: 'Pengecekan bangunan dan sosialisasi prosedur gempa',
      isPublished: true,
      victims: [],
      damages: [],
    },

    // ── Kutai Timur ────────────────────────────────────────────
    {
      title: 'Banjir Bandang Sangatta Utara Kutai Timur',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat & Angin Kencang'),
      description:
        'Banjir bandang menerjang permukiman di Kecamatan Sangatta Utara akibat meluapnya Sungai Sangatta. Arus deras membawa material kayu dan lumpur.',
      source: 'BPBD Kutai Timur',
      occurredDate: new Date('2026-02-20'),
      occurredTime: '03:30:00',
      regencyId: '6404',
      districtId: '640409',
      villageName: 'Sangatta Utara',
      latitude: '0.9845',
      longitude: '117.5801',
      status: 'selesai' as const,
      currentCondition: 'Sudah Surut',
      currentEffort: 'Evakuasi korban, distribusi logistik dan pembersihan lumpur',
      isPublished: true,
      victims: [
        {
          impactType: 'meninggal' as const,
          ageGroup: 'dewasa' as const,
          countMale: 2,
          countFemale: 0,
        },
        { impactType: 'hilang' as const, ageGroup: 'anak' as const, countMale: 1, countFemale: 0 },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 180,
          countFemale: 165,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 12,
          moderateDamage: 25,
          lightDamage: 40,
          estimatedLoss: 2100000000,
        },
        {
          assetName: 'Jembatan',
          heavyDamage: 1,
          moderateDamage: 0,
          lightDamage: 0,
          estimatedLoss: 500000000,
        },
      ],
    },
    {
      title: 'Karhutla Bengalon Kutai Timur',
      disasterTypeId: typeId('Karhutla'),
      causeId: causeId('Pembakaran Lahan'),
      description:
        'Kebakaran hutan dan lahan meluas hingga 120 hektar di Kecamatan Bengalon. Asap pekat menyelimuti wilayah sekitar dan mengganggu aktivitas warga.',
      source: 'Satgas Karhutla Kutai Timur',
      occurredDate: new Date('2026-03-01'),
      occurredTime: '11:00:00',
      regencyId: '6404',
      districtId: '640410',
      villageName: 'Sepaso',
      latitude: '1.1234',
      longitude: '117.8901',
      status: 'aktif' as const,
      currentCondition: 'Masih Berlangsung',
      currentEffort: 'Pemadaman oleh tim darat dan udara (helikopter water bombing)',
      isPublished: true,
      victims: [],
      damages: [
        {
          assetName: 'Lahan/Sawah',
          heavyDamage: 120,
          moderateDamage: 0,
          lightDamage: 0,
          estimatedLoss: 1200000000,
        },
      ],
    },

    // ── Berau ──────────────────────────────────────────────────
    {
      title: 'Banjir Tanjung Redeb Berau',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Banjir merendam permukiman di Kecamatan Tanjung Redeb akibat luapan Sungai Segah dan Sungai Kelay. Ribuan warga terdampak.',
      source: 'BPBD Kabupaten Berau',
      occurredDate: new Date('2026-01-30'),
      occurredTime: '22:00:00',
      regencyId: '6405',
      districtId: '640503',
      villageName: 'Bugis',
      latitude: '2.1523',
      longitude: '117.4801',
      status: 'selesai' as const,
      currentCondition: 'Sudah Surut',
      currentEffort: 'Distribusi bantuan logistik dan perbaikan infrastruktur',
      isPublished: true,
      victims: [
        {
          impactType: 'menderita' as const,
          ageGroup: 'dewasa' as const,
          countMale: 450,
          countFemale: 421,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'anak' as const,
          countMale: 210,
          countFemale: 198,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 8,
          moderateDamage: 45,
          lightDamage: 120,
          estimatedLoss: 3500000000,
        },
        {
          assetName: 'Sekolah',
          heavyDamage: 0,
          moderateDamage: 1,
          lightDamage: 2,
          estimatedLoss: 250000000,
        },
      ],
    },
    {
      title: 'Abrasi Pantai Derawan Berau',
      disasterTypeId: typeId('Gelombang Tinggi/Abrasi'),
      causeId: causeId('Angin Kencang'),
      description:
        'Abrasi pantai mengancam fasilitas wisata dan permukiman di Pulau Derawan. Garis pantai mundur hingga 3 meter dalam beberapa hari terakhir.',
      source: 'BPBD Berau / Dinas Pariwisata',
      occurredDate: new Date('2026-04-15'),
      occurredTime: '10:00:00',
      regencyId: '6405',
      districtId: '640509',
      villageName: 'Pulau Derawan',
      latitude: '2.2834',
      longitude: '118.2401',
      status: 'ditangani' as const,
      currentCondition: 'Dalam Penanganan',
      currentEffort: 'Pemasangan bronjong penahan abrasi dan kajian teknis',
      isPublished: true,
      victims: [],
      damages: [
        {
          assetName: 'Fasilitas Umum',
          heavyDamage: 0,
          moderateDamage: 3,
          lightDamage: 5,
          estimatedLoss: 420000000,
        },
      ],
    },

    // ── Penajam Paser Utara ────────────────────────────────────
    {
      title: 'Kebakaran Pemukiman Penajam',
      disasterTypeId: typeId('Kebakaran'),
      causeId: causeId('Konsleting Listrik'),
      description:
        'Kebakaran menghanguskan 7 unit rumah di kawasan padat penduduk Kecamatan Penajam. Api berhasil dipadamkan dalam 3 jam.',
      source: 'BPBD PPU / Disdamkar',
      occurredDate: new Date('2026-02-10'),
      occurredTime: '01:15:00',
      regencyId: '6409',
      districtId: '640901',
      villageName: 'Sungai Parit',
      addressDetail: 'RT 08 RW 03',
      latitude: '-1.4823',
      longitude: '116.5812',
      status: 'selesai' as const,
      currentCondition: 'Sudah Padam',
      currentEffort: 'Bantuan logistik dan hunian sementara bagi korban',
      isPublished: true,
      victims: [
        {
          impactType: 'luka_sakit' as const,
          ageGroup: 'lansia' as const,
          countMale: 0,
          countFemale: 1,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 18,
          countFemale: 16,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'anak' as const,
          countMale: 9,
          countFemale: 8,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 5,
          moderateDamage: 2,
          lightDamage: 0,
          estimatedLoss: 680000000,
        },
      ],
    },
    {
      title: 'Banjir Sepaku Penajam Paser Utara',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Banjir melanda Kecamatan Sepaku yang merupakan kawasan penyangga IKN. Ketinggian air mencapai 80 cm di beberapa titik pemukiman.',
      source: 'BPBD Penajam Paser Utara',
      occurredDate: new Date('2026-03-05'),
      occurredTime: '15:00:00',
      regencyId: '6409',
      districtId: '640904',
      villageName: 'Pemaluan',
      latitude: '-1.1234',
      longitude: '116.7801',
      status: 'aktif' as const,
      currentCondition: 'Masih Berlangsung',
      currentEffort: 'Koordinasi dengan PUPR IKN untuk penanganan drainase',
      isPublished: true,
      victims: [
        {
          impactType: 'menderita' as const,
          ageGroup: 'dewasa' as const,
          countMale: 85,
          countFemale: 79,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 0,
          moderateDamage: 8,
          lightDamage: 22,
          estimatedLoss: 380000000,
        },
      ],
    },

    // ── Paser ──────────────────────────────────────────────────
    {
      title: 'Banjir Tanah Grogot Paser',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Luapan Sungai Kandilo menggenangi permukiman di Kecamatan Tanah Grogot. Banjir terjadi setiap tahun namun tahun ini lebih parah karena curah hujan tinggi.',
      source: 'BPBD Kabupaten Paser',
      occurredDate: new Date('2026-01-25'),
      occurredTime: '12:00:00',
      regencyId: '6401',
      districtId: '640101',
      villageName: 'Tanah Grogot',
      latitude: '-1.9234',
      longitude: '116.1801',
      status: 'selesai' as const,
      currentCondition: 'Sudah Surut',
      currentEffort: 'Evakuasi, logistik, dan pendataan kerusakan',
      isPublished: true,
      victims: [
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 124,
          countFemale: 118,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'anak' as const,
          countMale: 65,
          countFemale: 58,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 2,
          moderateDamage: 18,
          lightDamage: 45,
          estimatedLoss: 750000000,
        },
      ],
    },
    {
      title: 'Longsor Long Ikis Paser',
      disasterTypeId: typeId('Tanah Longsor'),
      causeId: causeId('Hujan Sedang - Lebat & Angin Kencang'),
      description:
        'Longsor memutus akses jalan trans Kalimantan di Kecamatan Long Ikis. Material tanah menutup ruas jalan sepanjang 30 meter dengan ketinggian 4 meter.',
      source: 'Dinas Bina Marga Paser',
      occurredDate: new Date('2026-02-18'),
      occurredTime: '04:00:00',
      regencyId: '6401',
      districtId: '640103',
      villageName: 'Long Ikis',
      latitude: '-1.6345',
      longitude: '116.3201',
      status: 'selesai' as const,
      currentCondition: 'Tidak Ada Korban Jiwa',
      currentEffort: 'Pembersihan material longsor dengan excavator',
      isPublished: true,
      victims: [],
      damages: [
        {
          assetName: 'Jalan',
          heavyDamage: 1,
          moderateDamage: 0,
          lightDamage: 0,
          estimatedLoss: 350000000,
        },
      ],
    },

    // ── Bontang ────────────────────────────────────────────────
    {
      title: 'Kebakaran Permukiman Api-Api Bontang Utara',
      disasterTypeId: typeId('Kebakaran'),
      causeId: causeId('Kebakaran Genset'),
      description:
        'Kebakaran berawal dari genset yang mengalami korsleting di area permukiman semi-permanen. Api cepat menjalar karena material bangunan dari kayu.',
      source: 'BPBD Bontang / Disdamkar',
      occurredDate: new Date('2026-03-12'),
      occurredTime: '19:30:00',
      regencyId: '6474',
      districtId: '647401',
      villageName: 'Api-Api',
      latitude: '0.1423',
      longitude: '117.4812',
      status: 'selesai' as const,
      currentCondition: 'Sudah Padam',
      currentEffort: 'Penanganan korban dan penyediaan hunian darurat',
      isPublished: true,
      victims: [
        {
          impactType: 'meninggal' as const,
          ageGroup: 'anak' as const,
          countMale: 0,
          countFemale: 1,
        },
        {
          impactType: 'luka_sakit' as const,
          ageGroup: 'dewasa' as const,
          countMale: 3,
          countFemale: 2,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 22,
          countFemale: 20,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 8,
          moderateDamage: 4,
          lightDamage: 2,
          estimatedLoss: 920000000,
        },
      ],
    },
    {
      title: 'Banjir Berbas Pantai Bontang Selatan',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Rob dan hujan lebat mengakibatkan banjir di kawasan pesisir Berbas Pantai. Ketinggian air mencapai 40-60 cm.',
      source: 'BPBD Kota Bontang',
      occurredDate: new Date('2026-04-08'),
      occurredTime: '20:00:00',
      regencyId: '6474',
      districtId: '647402',
      villageName: 'Berbas Pantai',
      latitude: '0.1045',
      longitude: '117.4701',
      status: 'selesai' as const,
      currentCondition: 'Sudah Surut',
      currentEffort: 'Pompa air dan koordinasi normalisasi drainase',
      isPublished: true,
      victims: [
        {
          impactType: 'menderita' as const,
          ageGroup: 'dewasa' as const,
          countMale: 55,
          countFemale: 48,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 0,
          moderateDamage: 0,
          lightDamage: 18,
          estimatedLoss: 54000000,
        },
      ],
    },

    // ── Kutai Barat ────────────────────────────────────────────
    {
      title: 'Banjir Melak Kutai Barat',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Sungai Mahakam meluap menggenangi Kecamatan Melak. Akses jalan ke beberapa desa terputus akibat banjir yang mencapai ketinggian 1,5 meter.',
      source: 'BPBD Kutai Barat',
      occurredDate: new Date('2026-01-20'),
      occurredTime: '08:00:00',
      regencyId: '6402',
      districtId: '640201',
      villageName: 'Melak Ulu',
      latitude: '0.2134',
      longitude: '115.6234',
      status: 'selesai' as const,
      currentCondition: 'Sudah Surut',
      currentEffort: 'Distribusi bantuan via perahu, koordinasi dengan pemerintah desa',
      isPublished: true,
      victims: [
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 200,
          countFemale: 185,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'anak' as const,
          countMale: 98,
          countFemale: 92,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'lansia' as const,
          countMale: 25,
          countFemale: 30,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 3,
          moderateDamage: 25,
          lightDamage: 68,
          estimatedLoss: 980000000,
        },
        {
          assetName: 'Sekolah',
          heavyDamage: 0,
          moderateDamage: 2,
          lightDamage: 1,
          estimatedLoss: 180000000,
        },
      ],
    },
    {
      title: 'Longsor Barong Tongkok Kutai Barat',
      disasterTypeId: typeId('Tanah Longsor'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Longsor merusak 3 unit rumah dan memutus jalan desa di Kecamatan Barong Tongkok.',
      source: 'BPBD Kutai Barat',
      occurredDate: new Date('2026-03-22'),
      occurredTime: '16:20:00',
      regencyId: '6402',
      districtId: '640202',
      villageName: 'Barong Tongkok',
      latitude: '0.2512',
      longitude: '115.7012',
      status: 'ditangani' as const,
      currentCondition: 'Dalam Penanganan',
      currentEffort: 'Evakuasi warga terdampak dan pembersihan material longsor',
      isPublished: true,
      victims: [
        {
          impactType: 'luka_sakit' as const,
          ageGroup: 'dewasa' as const,
          countMale: 1,
          countFemale: 0,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 8,
          countFemale: 7,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 2,
          moderateDamage: 1,
          lightDamage: 0,
          estimatedLoss: 250000000,
        },
      ],
    },

    // ── Mahakam Ulu ────────────────────────────────────────────
    {
      title: 'Banjir Long Bagun Mahakam Ulu',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat'),
      description:
        'Banjir besar melanda Long Bagun akibat curah hujan ekstrem di hulu Sungai Mahakam. Beberapa kampung terisolir dan hanya bisa diakses melalui jalur air.',
      source: 'BPBD Mahakam Ulu',
      occurredDate: new Date('2026-02-08'),
      occurredTime: '11:00:00',
      regencyId: '6411',
      districtId: '641103',
      villageName: 'Long Bagun Ilir',
      latitude: '0.5823',
      longitude: '115.0012',
      status: 'selesai' as const,
      currentCondition: 'Sudah Surut',
      currentEffort: 'Bantuan logistik via helikopter, koordinasi dengan TNI AU',
      isPublished: true,
      victims: [
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 320,
          countFemale: 298,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'anak' as const,
          countMale: 145,
          countFemale: 138,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 10,
          moderateDamage: 35,
          lightDamage: 80,
          estimatedLoss: 2800000000,
        },
        {
          assetName: 'Jembatan',
          heavyDamage: 1,
          moderateDamage: 1,
          lightDamage: 0,
          estimatedLoss: 750000000,
        },
      ],
    },

    // ── Kejadian aktif (belum selesai) ─────────────────────────
    {
      title: 'Karhutla Sangkulirang Kutai Timur',
      disasterTypeId: typeId('Karhutla'),
      causeId: causeId('Dalam Penyelidikan'),
      description:
        'Kebakaran hutan melanda kawasan Sangkulirang dan terus meluas. Tim pemadam gabungan kesulitan karena medan sulit dijangkau.',
      source: 'Satgas Karhutla Provinsi Kaltim',
      occurredDate: new Date('2026-05-20'),
      occurredTime: '09:00:00',
      regencyId: '6404',
      districtId: '640418',
      villageName: 'Sangkulirang',
      latitude: '0.9234',
      longitude: '117.9801',
      status: 'aktif' as const,
      currentCondition: 'Masih Berlangsung',
      currentEffort: 'Pemadaman darat dan koordinasi water bombing BNPB',
      isPublished: true,
      victims: [],
      damages: [
        {
          assetName: 'Lahan/Sawah',
          heavyDamage: 85,
          moderateDamage: 0,
          lightDamage: 0,
          estimatedLoss: 850000000,
        },
      ],
    },
    {
      title: 'Banjir Samboja Kutai Kartanegara',
      disasterTypeId: typeId('Banjir'),
      causeId: causeId('Hujan Sedang - Lebat & Angin Kencang'),
      description:
        'Hujan lebat sejak kemarin menyebabkan banjir di Kecamatan Samboja. Sejumlah rumah dan jalan nasional tergenang.',
      source: 'BPBD Kutai Kartanegara',
      occurredDate: new Date('2026-05-28'),
      occurredTime: '05:30:00',
      regencyId: '6403',
      districtId: '640301',
      villageName: 'Sanipah',
      latitude: '-0.9812',
      longitude: '117.2345',
      status: 'aktif' as const,
      currentCondition: 'Masih Berlangsung',
      currentEffort: 'Tim BPBD melakukan asesmen dan evakuasi warga terdampak',
      isPublished: true,
      victims: [
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 65,
          countFemale: 60,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'anak' as const,
          countMale: 32,
          countFemale: 28,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 0,
          moderateDamage: 5,
          lightDamage: 20,
          estimatedLoss: 250000000,
        },
      ],
    },
    {
      title: 'Kebakaran Permukiman Lok Tuan Bontang',
      disasterTypeId: typeId('Kebakaran'),
      causeId: causeId('Konsleting Listrik'),
      description:
        'Kebakaran melanda kawasan permukiman padat di Kelurahan Lok Tuan. Api masih dalam proses pemadaman oleh tim Disdamkar.',
      source: 'Disdamkar Bontang',
      occurredDate: new Date('2026-06-01'),
      occurredTime: '14:45:00',
      regencyId: '6474',
      districtId: '647401',
      villageName: 'Lok Tuan',
      latitude: '0.1634',
      longitude: '117.4923',
      status: 'ditangani' as const,
      currentCondition: 'Dalam Penanganan',
      currentEffort: '3 unit mobil pemadam di lokasi, evakuasi warga sedang berlangsung',
      isPublished: true,
      victims: [
        {
          impactType: 'luka_sakit' as const,
          ageGroup: 'dewasa' as const,
          countMale: 1,
          countFemale: 0,
        },
        {
          impactType: 'mengungsi' as const,
          ageGroup: 'dewasa' as const,
          countMale: 12,
          countFemale: 10,
        },
      ],
      damages: [
        {
          assetName: 'Rumah',
          heavyDamage: 3,
          moderateDamage: 2,
          lightDamage: 1,
          estimatedLoss: 360000000,
        },
      ],
    },
    {
      title: 'Gempa M3.8 Berau Terasa Hingga Tanjung Redeb',
      disasterTypeId: typeId('Gempa Bumi'),
      causeId: causeId('Gempa Tektonik'),
      description:
        'Gempa berkekuatan M3.8 dengan kedalaman 15 km terasa di Kabupaten Berau. Warga berhamburan keluar rumah namun tidak ada laporan kerusakan.',
      source: 'BMKG',
      occurredDate: new Date('2026-05-15'),
      occurredTime: '22:41:00',
      regencyId: '6405',
      districtId: '640503',
      villageName: 'Tanjung Redeb',
      latitude: '2.1345',
      longitude: '117.5012',
      status: 'selesai' as const,
      currentCondition: 'Tidak Ada Laporan Kerusakan',
      currentEffort: 'Pemantauan aftershock oleh BMKG',
      isPublished: true,
      victims: [],
      damages: [],
    },
    {
      title: 'Orang Hilang Terjatuh dari Kapal Muara Rapak Balikpapan',
      disasterTypeId: typeId('Lain-Lain'),
      causeId: causeId('Terjatuh dari Kapal'),
      description:
        'Seorang ABK kapal terjatuh ke laut di perairan Muara Rapak dan hilang. Tim SAR gabungan melakukan pencarian.',
      source: 'Basarnas Balikpapan',
      occurredDate: new Date('2026-05-25'),
      occurredTime: '16:00:00',
      regencyId: '6472',
      districtId: '647204',
      villageName: 'Muara Rapak',
      latitude: '-1.1923',
      longitude: '116.8534',
      status: 'ditangani' as const,
      currentCondition: 'Dalam Pencarian',
      currentEffort: 'Tim SAR Basarnas dan KN melakukan pencarian di perairan Muara Rapak',
      isPublished: true,
      victims: [
        {
          impactType: 'hilang' as const,
          ageGroup: 'dewasa' as const,
          countMale: 1,
          countFemale: 0,
        },
      ],
      damages: [],
    },
  ]

  console.log(`Seeding ${dummyIncidents.length} dummy incidents...`)

  for (const [i, data] of dummyIncidents.entries()) {
    const { victims, damages, ...incidentData } = data

    const [result] = await db
      .insert(incidents)
      .values({
        ...incidentData,
        occurredTime: incidentData.occurredTime ?? null,
        provinceId: '64',
        latitude: String(incidentData.latitude),
        longitude: String(incidentData.longitude),
      })
      .$returningId()

    const id = result.id

    if (victims.length > 0) {
      await db.insert(incidentVictims).values(
        victims.map((v) => ({
          incidentId: id,
          impactType: v.impactType as typeof incidentVictims.$inferInsert.impactType,
          ageGroup: v.ageGroup as typeof incidentVictims.$inferInsert.ageGroup,
          countMale: v.countMale,
          countFemale: v.countFemale,
          countTotal: v.countMale + v.countFemale,
        }))
      )
    }

    if (damages.length > 0) {
      await db.insert(incidentDamages).values(
        damages.map((d) => ({
          incidentId: id,
          assetName: d.assetName,
          heavyDamage: d.heavyDamage,
          moderateDamage: d.moderateDamage,
          lightDamage: d.lightDamage,
          estimatedLoss: String(d.estimatedLoss),
        }))
      )
    }

    console.log(`  ✓ [${i + 1}/30] ${data.title.slice(0, 50)}`)
  }

  console.log('\n✅ Seed selesai: 30 insiden + korban + kerugian material')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
