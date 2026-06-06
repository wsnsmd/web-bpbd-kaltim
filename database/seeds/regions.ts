// database/seeds/regions-seed.ts
// Seed data wilayah Kalimantan Timur
// Jalankan: bun run database/seeds/regions-seed.ts

import { db } from '@/lib/db'
import { regions } from '@db/schema/incidents'

const DATA: {
  id: string
  name: string
  level: 'provinsi' | 'kabkota' | 'kecamatan' | 'kelurahan'
  parentId: string | null
}[] = [
  // ── Provinsi ──
  { id: '64', name: 'Kalimantan Timur', level: 'provinsi', parentId: null },

  // ── Kabupaten / Kota ──
  { id: '6401', name: 'Kabupaten Paser', level: 'kabkota', parentId: '64' },
  { id: '6402', name: 'Kabupaten Kutai Barat', level: 'kabkota', parentId: '64' },
  { id: '6403', name: 'Kabupaten Kutai Kartanegara', level: 'kabkota', parentId: '64' },
  { id: '6404', name: 'Kabupaten Kutai Timur', level: 'kabkota', parentId: '64' },
  { id: '6405', name: 'Kabupaten Berau', level: 'kabkota', parentId: '64' },
  { id: '6409', name: 'Kabupaten Penajam Paser Utara', level: 'kabkota', parentId: '64' },
  { id: '6411', name: 'Kabupaten Mahakam Ulu', level: 'kabkota', parentId: '64' },
  { id: '6471', name: 'Kota Samarinda', level: 'kabkota', parentId: '64' },
  { id: '6472', name: 'Kota Balikpapan', level: 'kabkota', parentId: '64' },
  { id: '6474', name: 'Kota Bontang', level: 'kabkota', parentId: '64' },

  // ── Kecamatan: Kota Samarinda ──
  { id: '647101', name: 'Palaran', level: 'kecamatan', parentId: '6471' },
  { id: '647102', name: 'Samarinda Ilir', level: 'kecamatan', parentId: '6471' },
  { id: '647103', name: 'Samarinda Kota', level: 'kecamatan', parentId: '6471' },
  { id: '647104', name: 'Sambutan', level: 'kecamatan', parentId: '6471' },
  { id: '647105', name: 'Samarinda Seberang', level: 'kecamatan', parentId: '6471' },
  { id: '647106', name: 'Loa Janan Ilir', level: 'kecamatan', parentId: '6471' },
  { id: '647107', name: 'Sungai Kunjang', level: 'kecamatan', parentId: '6471' },
  { id: '647108', name: 'Samarinda Ulu', level: 'kecamatan', parentId: '6471' },
  { id: '647109', name: 'Samarinda Utara', level: 'kecamatan', parentId: '6471' },
  { id: '647110', name: 'Sungai Pinang', level: 'kecamatan', parentId: '6471' },

  // ── Kecamatan: Kota Balikpapan ──
  { id: '647201', name: 'Balikpapan Selatan', level: 'kecamatan', parentId: '6472' },
  { id: '647202', name: 'Balikpapan Timur', level: 'kecamatan', parentId: '6472' },
  { id: '647203', name: 'Balikpapan Barat', level: 'kecamatan', parentId: '6472' },
  { id: '647204', name: 'Balikpapan Utara', level: 'kecamatan', parentId: '6472' },
  { id: '647205', name: 'Balikpapan Tengah', level: 'kecamatan', parentId: '6472' },
  { id: '647206', name: 'Balikpapan Kota', level: 'kecamatan', parentId: '6472' },

  // ── Kecamatan: Kota Bontang ──
  { id: '647401', name: 'Bontang Utara', level: 'kecamatan', parentId: '6474' },
  { id: '647402', name: 'Bontang Selatan', level: 'kecamatan', parentId: '6474' },
  { id: '647403', name: 'Bontang Barat', level: 'kecamatan', parentId: '6474' },

  // ── Kecamatan: Kutai Kartanegara ──
  { id: '640301', name: 'Samboja', level: 'kecamatan', parentId: '6403' },
  { id: '640302', name: 'Muara Jawa', level: 'kecamatan', parentId: '6403' },
  { id: '640303', name: 'Sanga-Sanga', level: 'kecamatan', parentId: '6403' },
  { id: '640304', name: 'Loa Janan', level: 'kecamatan', parentId: '6403' },
  { id: '640305', name: 'Loa Kulu', level: 'kecamatan', parentId: '6403' },
  { id: '640306', name: 'Muara Muntai', level: 'kecamatan', parentId: '6403' },
  { id: '640307', name: 'Kota Bangun', level: 'kecamatan', parentId: '6403' },
  { id: '640308', name: 'Tenggarong', level: 'kecamatan', parentId: '6403' },
  { id: '640309', name: 'Sebulu', level: 'kecamatan', parentId: '6403' },
  { id: '640310', name: 'Tenggarong Seberang', level: 'kecamatan', parentId: '6403' },
  { id: '640311', name: 'Anggana', level: 'kecamatan', parentId: '6403' },
  { id: '640312', name: 'Muara Badak', level: 'kecamatan', parentId: '6403' },
  { id: '640313', name: 'Marang Kayu', level: 'kecamatan', parentId: '6403' },
  { id: '640314', name: 'Muara Kaman', level: 'kecamatan', parentId: '6403' },
  { id: '640315', name: 'Kembang Janggut', level: 'kecamatan', parentId: '6403' },
  { id: '640316', name: 'Tabang', level: 'kecamatan', parentId: '6403' },
  { id: '640317', name: 'Muara Wis', level: 'kecamatan', parentId: '6403' },
  { id: '640318', name: 'Kenohan', level: 'kecamatan', parentId: '6403' },
  { id: '640319', name: 'Muara Bengkal', level: 'kecamatan', parentId: '6403' },
  { id: '640320', name: 'Rantau Pulung', level: 'kecamatan', parentId: '6403' },

  // ── Kecamatan: Kutai Timur ──
  { id: '640401', name: 'Muara Ancalong', level: 'kecamatan', parentId: '6404' },
  { id: '640402', name: 'Busang', level: 'kecamatan', parentId: '6404' },
  { id: '640403', name: 'Long Mesangat', level: 'kecamatan', parentId: '6404' },
  { id: '640404', name: 'Muara Wahau', level: 'kecamatan', parentId: '6404' },
  { id: '640405', name: 'Telen', level: 'kecamatan', parentId: '6404' },
  { id: '640406', name: 'Kombeng', level: 'kecamatan', parentId: '6404' },
  { id: '640407', name: 'Muara Bengkal', level: 'kecamatan', parentId: '6404' },
  { id: '640408', name: 'Batu Ampar', level: 'kecamatan', parentId: '6404' },
  { id: '640409', name: 'Sangatta Utara', level: 'kecamatan', parentId: '6404' },
  { id: '640410', name: 'Bengalon', level: 'kecamatan', parentId: '6404' },
  { id: '640411', name: 'Teluk Pandan', level: 'kecamatan', parentId: '6404' },
  { id: '640412', name: 'Rantau Pulung', level: 'kecamatan', parentId: '6404' },
  { id: '640413', name: 'Sangatta Selatan', level: 'kecamatan', parentId: '6404' },
  { id: '640414', name: 'Kaliorang', level: 'kecamatan', parentId: '6404' },
  { id: '640415', name: 'Kaubun', level: 'kecamatan', parentId: '6404' },
  { id: '640416', name: 'Karangan', level: 'kecamatan', parentId: '6404' },
  { id: '640417', name: 'Sandaran', level: 'kecamatan', parentId: '6404' },
  { id: '640418', name: 'Sangkulirang', level: 'kecamatan', parentId: '6404' },

  // ── Kecamatan: Berau ──
  { id: '640501', name: 'Kelay', level: 'kecamatan', parentId: '6405' },
  { id: '640502', name: 'Segah', level: 'kecamatan', parentId: '6405' },
  { id: '640503', name: 'Tanjung Redeb', level: 'kecamatan', parentId: '6405' },
  { id: '640504', name: 'Gunung Tabur', level: 'kecamatan', parentId: '6405' },
  { id: '640505', name: 'Sambaliung', level: 'kecamatan', parentId: '6405' },
  { id: '640506', name: 'Teluk Bayur', level: 'kecamatan', parentId: '6405' },
  { id: '640507', name: 'Batu Putih', level: 'kecamatan', parentId: '6405' },
  { id: '640508', name: 'Biduk-Biduk', level: 'kecamatan', parentId: '6405' },
  { id: '640509', name: 'Pulau Derawan', level: 'kecamatan', parentId: '6405' },
  { id: '640510', name: 'Maratua', level: 'kecamatan', parentId: '6405' },
  { id: '640511', name: 'Tabalar', level: 'kecamatan', parentId: '6405' },
  { id: '640512', name: 'Biatan', level: 'kecamatan', parentId: '6405' },
  { id: '640513', name: 'Talisayan', level: 'kecamatan', parentId: '6405' },

  // ── Kecamatan: Paser ──
  { id: '640101', name: 'Tanah Grogot', level: 'kecamatan', parentId: '6401' },
  { id: '640102', name: 'Kuaro', level: 'kecamatan', parentId: '6401' },
  { id: '640103', name: 'Long Ikis', level: 'kecamatan', parentId: '6401' },
  { id: '640104', name: 'Batu Sopang', level: 'kecamatan', parentId: '6401' },
  { id: '640105', name: 'Muara Samu', level: 'kecamatan', parentId: '6401' },
  { id: '640106', name: 'Long Kali', level: 'kecamatan', parentId: '6401' },
  { id: '640107', name: 'Paser Belengkong', level: 'kecamatan', parentId: '6401' },
  { id: '640108', name: 'Muara Komam', level: 'kecamatan', parentId: '6401' },
  { id: '640109', name: 'Batu Engau', level: 'kecamatan', parentId: '6401' },
  { id: '640110', name: 'Tanjung Harapan', level: 'kecamatan', parentId: '6401' },

  // ── Kecamatan: Kutai Barat ──
  { id: '640201', name: 'Melak', level: 'kecamatan', parentId: '6402' },
  { id: '640202', name: 'Barong Tongkok', level: 'kecamatan', parentId: '6402' },
  { id: '640203', name: 'Penyinggahan', level: 'kecamatan', parentId: '6402' },
  { id: '640204', name: 'Muara Pahu', level: 'kecamatan', parentId: '6402' },
  { id: '640205', name: 'Long Iram', level: 'kecamatan', parentId: '6402' },
  { id: '640206', name: 'Bentian Besar', level: 'kecamatan', parentId: '6402' },
  { id: '640207', name: 'Jempang', level: 'kecamatan', parentId: '6402' },
  { id: '640208', name: 'Bongan', level: 'kecamatan', parentId: '6402' },
  { id: '640209', name: 'Tering', level: 'kecamatan', parentId: '6402' },
  { id: '640210', name: 'Laham', level: 'kecamatan', parentId: '6402' },
  { id: '640211', name: 'Long Hubung', level: 'kecamatan', parentId: '6402' },
  { id: '640212', name: 'Muara Lawa', level: 'kecamatan', parentId: '6402' },
  { id: '640213', name: 'Damai', level: 'kecamatan', parentId: '6402' },
  { id: '640214', name: 'Sekolaq Darat', level: 'kecamatan', parentId: '6402' },

  // ── Kecamatan: Penajam Paser Utara ──
  { id: '640901', name: 'Penajam', level: 'kecamatan', parentId: '6409' },
  { id: '640902', name: 'Waru', level: 'kecamatan', parentId: '6409' },
  { id: '640903', name: 'Babulu', level: 'kecamatan', parentId: '6409' },
  { id: '640904', name: 'Sepaku', level: 'kecamatan', parentId: '6409' },

  // ── Kecamatan: Mahakam Ulu ──
  { id: '641101', name: 'Long Apari', level: 'kecamatan', parentId: '6411' },
  { id: '641102', name: 'Long Pahangai', level: 'kecamatan', parentId: '6411' },
  { id: '641103', name: 'Long Bagun', level: 'kecamatan', parentId: '6411' },
  { id: '641104', name: 'Long Hubung', level: 'kecamatan', parentId: '6411' },
  { id: '641105', name: 'Laham', level: 'kecamatan', parentId: '6411' },

  // ── Kelurahan: Samarinda - Sungai Kunjang ──
  { id: '64710701', name: 'Loa Bakung', level: 'kelurahan', parentId: '647107' },
  { id: '64710702', name: 'Loa Buah', level: 'kelurahan', parentId: '647107' },
  { id: '64710703', name: 'Lok Bahu', level: 'kelurahan', parentId: '647107' },
  { id: '64710704', name: 'Karang Asam Ulu', level: 'kelurahan', parentId: '647107' },
  { id: '64710705', name: 'Karang Asam Ilir', level: 'kelurahan', parentId: '647107' },
  { id: '64710706', name: 'Teluk Lerong Ulu', level: 'kelurahan', parentId: '647107' },
  { id: '64710707', name: 'Simpang Tiga', level: 'kelurahan', parentId: '647107' },

  // ── Kelurahan: Samarinda - Samarinda Ulu ──
  { id: '64710801', name: 'Air Putih', level: 'kelurahan', parentId: '647108' },
  { id: '64710802', name: 'Bukit Pinang', level: 'kelurahan', parentId: '647108' },
  { id: '64710803', name: 'Dadi Mulya', level: 'kelurahan', parentId: '647108' },
  { id: '64710804', name: 'Gunung Kelua', level: 'kelurahan', parentId: '647108' },
  { id: '64710805', name: 'Jawa', level: 'kelurahan', parentId: '647108' },
  { id: '64710806', name: 'Sidodadi', level: 'kelurahan', parentId: '647108' },
  { id: '64710807', name: 'Teluk Lerong Ilir', level: 'kelurahan', parentId: '647108' },

  // ── Kelurahan: Samarinda - Samarinda Utara ──
  { id: '64710901', name: 'Lempake', level: 'kelurahan', parentId: '647109' },
  { id: '64710902', name: 'Sempaja Barat', level: 'kelurahan', parentId: '647109' },
  { id: '64710903', name: 'Sempaja Selatan', level: 'kelurahan', parentId: '647109' },
  { id: '64710904', name: 'Sempaja Timur', level: 'kelurahan', parentId: '647109' },
  { id: '64710905', name: 'Sempaja Utara', level: 'kelurahan', parentId: '647109' },
  { id: '64710906', name: 'Sungai Siring', level: 'kelurahan', parentId: '647109' },
  { id: '64710907', name: 'Tanah Merah', level: 'kelurahan', parentId: '647109' },

  // ── Kelurahan: Samarinda - Sungai Pinang ──
  { id: '64711001', name: 'Mugirejo', level: 'kelurahan', parentId: '647110' },
  { id: '64711002', name: 'Sungai Pinang Dalam', level: 'kelurahan', parentId: '647110' },
  { id: '64711003', name: 'Sungai Pinang Luar', level: 'kelurahan', parentId: '647110' },
  { id: '64711004', name: 'Temindung Permai', level: 'kelurahan', parentId: '647110' },
  { id: '64711005', name: 'Bandara', level: 'kelurahan', parentId: '647110' },

  // ── Kelurahan: Samarinda - Palaran ──
  { id: '64710101', name: 'Bukuan', level: 'kelurahan', parentId: '647101' },
  { id: '64710102', name: 'Handil Bakti', level: 'kelurahan', parentId: '647101' },
  { id: '64710103', name: 'Rawa Makmur', level: 'kelurahan', parentId: '647101' },
  { id: '64710104', name: 'Simpang Pasir', level: 'kelurahan', parentId: '647101' },
  { id: '64710105', name: 'Sungai Kapih', level: 'kelurahan', parentId: '647101' },

  // ── Kelurahan: Samarinda - Samarinda Seberang ──
  { id: '64710501', name: 'Baqa', level: 'kelurahan', parentId: '647105' },
  { id: '64710502', name: 'Gunung Panjang', level: 'kelurahan', parentId: '647105' },
  { id: '64710503', name: 'Mesjid', level: 'kelurahan', parentId: '647105' },
  { id: '64710504', name: 'Sungai Keledang', level: 'kelurahan', parentId: '647105' },
  { id: '64710505', name: 'Tenun', level: 'kelurahan', parentId: '647105' },

  // ── Kelurahan: Samarinda - Samarinda Ilir ──
  { id: '64710201', name: 'Selili', level: 'kelurahan', parentId: '647102' },
  { id: '64710202', name: 'Sidodamai', level: 'kelurahan', parentId: '647102' },
  { id: '64710203', name: 'Sidomulyo', level: 'kelurahan', parentId: '647102' },
  { id: '64710204', name: 'Sungai Dama', level: 'kelurahan', parentId: '647102' },
  { id: '64710205', name: 'Simpang Tiga', level: 'kelurahan', parentId: '647102' },

  // ── Kelurahan: Samarinda - Samarinda Kota ──
  { id: '64710301', name: 'Bugis', level: 'kelurahan', parentId: '647103' },
  { id: '64710302', name: 'Karang Mumus', level: 'kelurahan', parentId: '647103' },
  { id: '64710303', name: 'Pasar Pagi', level: 'kelurahan', parentId: '647103' },
  { id: '64710304', name: 'Pelabuhan', level: 'kelurahan', parentId: '647103' },
  { id: '64710305', name: 'Sungai Pinang Luar', level: 'kelurahan', parentId: '647103' },

  // ── Kelurahan: Samarinda - Sambutan ──
  { id: '64710401', name: 'Sambutan', level: 'kelurahan', parentId: '647104' },
  { id: '64710402', name: 'Sungai Kapih', level: 'kelurahan', parentId: '647104' },
  { id: '64710403', name: 'Sindang Sari', level: 'kelurahan', parentId: '647104' },

  // ── Kelurahan: Samarinda - Loa Janan Ilir ──
  { id: '64710601', name: 'Harapan Baru', level: 'kelurahan', parentId: '647106' },
  { id: '64710602', name: 'Simpang Tiga', level: 'kelurahan', parentId: '647106' },
  { id: '64710603', name: 'Tani Aman', level: 'kelurahan', parentId: '647106' },

  // ── Kelurahan: Balikpapan - Balikpapan Barat ──
  { id: '64720301', name: 'Baru Ilir', level: 'kelurahan', parentId: '647203' },
  { id: '64720302', name: 'Baru Tengah', level: 'kelurahan', parentId: '647203' },
  { id: '64720303', name: 'Baru Ulu', level: 'kelurahan', parentId: '647203' },
  { id: '64720304', name: 'Kariangau', level: 'kelurahan', parentId: '647203' },
  { id: '64720305', name: 'Margasari', level: 'kelurahan', parentId: '647203' },
  { id: '64720306', name: 'Margo Mulyo', level: 'kelurahan', parentId: '647203' },

  // ── Kelurahan: Balikpapan - Balikpapan Utara ──
  { id: '64720401', name: 'Batu Ampar', level: 'kelurahan', parentId: '647204' },
  { id: '64720402', name: 'Graha Indah', level: 'kelurahan', parentId: '647204' },
  { id: '64720403', name: 'Karang Joang', level: 'kelurahan', parentId: '647204' },
  { id: '64720404', name: 'Muara Rapak', level: 'kelurahan', parentId: '647204' },

  // ── Kelurahan: Balikpapan - Balikpapan Selatan ──
  { id: '64720101', name: 'Gunung Bahagia', level: 'kelurahan', parentId: '647201' },
  { id: '64720102', name: 'Gunung Sari Ilir', level: 'kelurahan', parentId: '647201' },
  { id: '64720103', name: 'Gunung Sari Ulu', level: 'kelurahan', parentId: '647201' },
  { id: '64720104', name: 'Sepinggan', level: 'kelurahan', parentId: '647201' },
  { id: '64720105', name: 'Sepinggan Baru', level: 'kelurahan', parentId: '647201' },
  { id: '64720106', name: 'Sepinggan Raya', level: 'kelurahan', parentId: '647201' },
  { id: '64720107', name: 'Sumber Rejo', level: 'kelurahan', parentId: '647201' },

  // ── Kelurahan: Balikpapan - Balikpapan Tengah ──
  { id: '64720501', name: 'Gunung Sari Ulu', level: 'kelurahan', parentId: '647205' },
  { id: '64720502', name: 'Karang Jati', level: 'kelurahan', parentId: '647205' },
  { id: '64720503', name: 'Karang Rejo', level: 'kelurahan', parentId: '647205' },
  { id: '64720504', name: 'Sumber Rejo', level: 'kelurahan', parentId: '647205' },

  // ── Kelurahan: Balikpapan - Balikpapan Kota ──
  { id: '64720601', name: 'Klandasan Ilir', level: 'kelurahan', parentId: '647206' },
  { id: '64720602', name: 'Klandasan Ulu', level: 'kelurahan', parentId: '647206' },
  { id: '64720603', name: 'Prapatan', level: 'kelurahan', parentId: '647206' },
  { id: '64720604', name: 'Telaga Sari', level: 'kelurahan', parentId: '647206' },

  // ── Kelurahan: Balikpapan - Balikpapan Timur ──
  { id: '64720201', name: 'Manggar', level: 'kelurahan', parentId: '647202' },
  { id: '64720202', name: 'Manggar Baru', level: 'kelurahan', parentId: '647202' },
  { id: '64720203', name: 'Lamaru', level: 'kelurahan', parentId: '647202' },

  // ── Kelurahan: Bontang - Bontang Utara ──
  { id: '64740101', name: 'Api-Api', level: 'kelurahan', parentId: '647401' },
  { id: '64740102', name: 'Bontang Baru', level: 'kelurahan', parentId: '647401' },
  { id: '64740103', name: 'Guntung', level: 'kelurahan', parentId: '647401' },
  { id: '64740104', name: 'Gunung Elai', level: 'kelurahan', parentId: '647401' },
  { id: '64740105', name: 'Lok Tuan', level: 'kelurahan', parentId: '647401' },

  // ── Kelurahan: Bontang - Bontang Selatan ──
  { id: '64740201', name: 'Berbas Pantai', level: 'kelurahan', parentId: '647402' },
  { id: '64740202', name: 'Berbas Tengah', level: 'kelurahan', parentId: '647402' },
  { id: '64740203', name: 'Belimbing', level: 'kelurahan', parentId: '647402' },
  { id: '64740204', name: 'Satimpo', level: 'kelurahan', parentId: '647402' },
  { id: '64740205', name: 'Tanjung Laut', level: 'kelurahan', parentId: '647402' },

  // ── Kelurahan: Bontang - Bontang Barat ──
  { id: '64740301', name: 'Belimbing', level: 'kelurahan', parentId: '647403' },
  { id: '64740302', name: 'Kanaan', level: 'kelurahan', parentId: '647403' },
  { id: '64740303', name: 'Gunung Elai', level: 'kelurahan', parentId: '647403' },
]

async function seed() {
  console.log(`Seeding ${DATA.length} wilayah records...`)
  // Insert batch per 50
  for (let i = 0; i < DATA.length; i += 50) {
    const batch = DATA.slice(i, i + 50)
    for (const row of batch) {
      await db
        .insert(regions)
        .values(row)
        .onDuplicateKeyUpdate({ set: { name: row.name } })
    }
    console.log(`  ✓ ${Math.min(i + 50, DATA.length)} / ${DATA.length}`)
  }
  console.log('✓ Regions seed selesai')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
