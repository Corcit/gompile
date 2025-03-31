/**
 * Boycott Companies Data
 * 
 * This file contains data for the boycottCompanies collection and provides
 * functions to add this data to Firebase Firestore.
 */

import { doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { firestore } from './firebase';

// Define the type for boycott company data
export interface BoycottCompany {
  id: string;
  name: string;
  logo: string;
  category: string;
  reason: string;
  startDate: string | Date | Timestamp;
  description: string;
  alternativeCompanies: string[];
  link: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Data for boycottCompanies collection
export const boycottCompaniesData: BoycottCompany[] = [
  {
    id: "1",
    name: "Espressolab",
    logo: "https://seeklogo.com/images/E/espressolab-logo-3D14FB127A-seeklogo.com.png",
    category: "Kafe",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Espressolab, AKP yanlısı Kocadağ Aile Şirketleri'ne aittir ve CHP Genel Başkanı Özgür Özel'in boykot çağrısında açıkça ismi geçmiştir. Şirket, hükümet yetkilileriyle yakın bağları ve hükümet yanlısı girişimlere finansal desteği nedeniyle eleştirilmiştir.",
    alternativeCompanies: ["Kahve Dünyası", "MOC Coffee", "Arabica Coffee"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "2",
    name: "D&R",
    logo: "https://seeklogo.com/images/D/dr-logo-F5FE8D1987-seeklogo.com.png",
    category: "Kitabevi",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "D&R, Cumhurbaşkanı Erdoğan'a yakın bağları olan Demirören Grubu'nun mülkiyetindedir. Kitabevi zinciri, CHP'nin boykot çağrısı yapan mitinginden kısa bir süre sonra çevrimdışı olmuştur. Kitap satışlarından elde edilen gelirin doğrudan hükümet yanlısı medya operasyonlarını desteklediği iddia edilmektedir.",
    alternativeCompanies: ["Homer Kitabevi", "Pandora Kitabevi", "Robinson Crusoe 389"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "3",
    name: "İdefix",
    logo: "https://upload.wikimedia.org/wikipedia/tr/5/57/%C4%B0defix_logo.png",
    category: "Online Kitabevi",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "İdefix de güçlü hükümet bağlantıları olan Demirören Grubu'na aittir. Eğitim platformu Evrim Ağacı, şirketin hükümet politikalarını desteklemesi ve farklı seslere platform sağlamadaki başarısızlığı nedeniyle kitaplarını İdefix'ten çekmiştir.",
    alternativeCompanies: ["Kitapyurdu", "BKM Kitap", "Istanbul Books"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "4",
    name: "CNNTürk",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/CNN_T%C3%BCrk_logo.svg/1200px-CNN_T%C3%BCrk_logo.svg.png",
    category: "Medya/Televizyon",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "CNN Türk, AKP hükümetini destekleyen taraflı yayınları nedeniyle eleştirilmiştir. 2013 Gezi Parkı protestoları sırasında, kanal kitlesel gösterileri haber yapmak yerine meşhur bir şekilde penguen belgeseli yayınlamış ve eleştirmenler arasında 'Penguen TV' lakabını kazanmıştır.",
    alternativeCompanies: ["Halk TV", "TELE1", "Sözcü", "Anka Haber", "Medyaskop"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "5",
    name: "TRT",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/TRT_logo.svg/800px-TRT_logo.svg.png",
    category: "Medya/Televizyon",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Devlet yayıncısı TRT, giderek kamu hizmeti yayıncısı olmaktan çıkıp AKP hükümetinin propaganda aracı haline gelmiştir. Özellikle seçimler ve siyasi gerginlik dönemlerinde muhalefet seslerini sınırlarken, hükümet yetkililerine orantısız şekilde yayın süresi vermektedir.",
    alternativeCompanies: ["Halk TV", "TELE1", "Sözcü", "Anka Haber", "Medyaskop"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "6",
    name: "TGRT",
    logo: "https://upload.wikimedia.org/wikipedia/tr/thumb/0/0e/TGRT_Haber_logosu.png/800px-TGRT_Haber_logosu.png",
    category: "Medya/Televizyon",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "TGRT, hükümete yakın bağları olan İhlas Holding'e aittir. Kanal, tutarlı bir şekilde hükümet yanlısı taraflı haber sunmakta ve hükümet politikalarına karşı protestoları ve gösterileri haber yapmamakla eleştirilmektedir.",
    alternativeCompanies: ["Halk TV", "TELE1", "Sözcü", "Anka Haber", "Medyaskop"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "7",
    name: "NTV",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Ntv_logo.png",
    category: "Medya/Televizyon",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "NTV, Doğuş Grup'a aittir ve hükümet karşıtı protestolar karşısındaki sessizliği nedeniyle eleştirilmiştir. Özel'in boykot konuşmasında 'Bir daha araba sattırmayacağım' uyarısı ile özellikle hedef alındıktan sonra kanal hızla protesto haberlerini yayınlamaya başlamış, bu da siyasi güdümlü editoryal kararlarını ortaya çıkarmıştır.",
    alternativeCompanies: ["Halk TV", "TELE1", "Sözcü", "Anka Haber", "Medyaskop"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "8",
    name: "Kral FM",
    logo: "https://upload.wikimedia.org/wikipedia/tr/a/a5/Kral_FM_logo.png",
    category: "Radyo/Medya",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Kral FM, Demirören Medya Grubu'na aittir. Bu grup, satın aldıktan sonra eskiden bağımsız olan medya kuruluşlarını hükümet yanlısı sözcülere dönüştürmüştür. Radyo istasyonu, Cumhurbaşkanı Erdoğan'ın politikalarını yoğun şekilde destekleyen bir medya grubunun parçası olduğu için boykot edilmektedir.",
    alternativeCompanies: ["Açık Radyo", "Radyo Özgür", "Best FM"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "9",
    name: "Star TV",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Star_TV_2012.png",
    category: "Medya/Televizyon",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Star TV, hükümeti destekleyen taraflı yayınları nedeniyle eleştirilen Doğuş Medya Grubu'nun bir parçasıdır. Kanal sıklıkla hükümet karşıtı protestoları görmezden gelmekte ve siyasi olayları tek taraflı sunarak Türk medyasındaki bilgi boşluğuna katkıda bulunmaktadır.",
    alternativeCompanies: ["Halk TV", "TELE1", "Sözcü", "Anka Haber", "Medyaskop"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "10",
    name: "Akşam Gazetesi",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Ak%C5%9Fam_gazetesi_logosu.jpg",
    category: "Gazete/Medya",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Akşam gazetesi, çok sayıda hükümet inşaat sözleşmesi alan Kalyon Grubu'nun kontrolündeki Turkuvaz Medya Grubu'na aittir. Gazete sürekli olarak hükümet yanlısı içerik yayınlarken muhalefet figürlerini hedef almakta ve dezenformasyon yaymakla eleştirilmektedir.",
    alternativeCompanies: ["Cumhuriyet", "Sözcü", "BirGün"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "11",
    name: "Beyaz TV",
    logo: "https://upload.wikimedia.org/wikipedia/tr/thumb/7/7e/Beyaz_TV_logo.png/800px-Beyaz_TV_logo.png",
    category: "Medya/Televizyon",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Beyaz TV, AKP hükümetiyle güçlü bağlara sahiptir ve eski sahipliği Ankara'nın eski belediye başkanı Melih Gökçek'e bağlıdır. Kanal düzenli olarak muhalefet figürlerini hedef alan ve hükümet anlatılarını destekleyen içerikler yayınlamakta, sıklıkla hükümet eleştirmenlerine karşı kışkırtıcı bir retorik kullanmaktadır.",
    alternativeCompanies: ["Halk TV", "TELE1", "Sözcü", "Anka Haber", "Medyaskop"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "12",
    name: "Yeni Şafak",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Yeni_%C5%9Eafak_logo.png",
    category: "Gazete/Medya",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Yeni Şafak, eski CEO'su Cumhurbaşkanı Erdoğan döneminde Hazine ve Maliye Bakanı olan Albayrak Grubu'na aittir. Gazete, tutarlı bir şekilde hükümet yanlısı ve dini muhafazakâr içerik yayınlamakta, sıklıkla muhalefet figürlerini ve hükümet eleştirmenlerini hedef almaktadır.",
    alternativeCompanies: ["Cumhuriyet", "Sözcü", "BirGün"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "13",
    name: "Türkiye Gazetesi",
    logo: "https://upload.wikimedia.org/wikipedia/tr/9/9c/T%C3%BCrkiye_Gazetesi_logosu.png",
    category: "Gazete/Medya",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Türkiye Gazetesi, hükümete yakın bağları olan İhlas Holding'e aittir. Gazete tutarlı bir şekilde güçlü hükümet yanlısı taraflı haber sunmakta ve özellikle siyasi gerginlik dönemlerinde gazetecilikte nesnellik eksikliği nedeniyle eleştirilmektedir.",
    alternativeCompanies: ["Cumhuriyet", "Sözcü", "Evrensel"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "14",
    name: "Doğuş Grubu",
    logo: "https://upload.wikimedia.org/wikipedia/tr/9/90/Do%C4%9Fu%C5%9F_Grubu_logo.png",
    category: "Holding",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Doğuş Grubu, hükümet yanlısı tutumları nedeniyle eleştirilen NTV ve Star TV dahil olmak üzere çok sayıda medya kuruluşuna sahiptir. Şirket birçok hükümet sözleşmesinden yararlanmış ve medya varlıklarını iktidar partisine yaranmak için kullanmakla suçlanmaktadır.",
    alternativeCompanies: ["Koç Holding", "Eczacıbaşı Holding", "Borusan Holding"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "15",
    name: "Volkswagen",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/800px-Volkswagen_logo_2019.svg.png",
    category: "Otomotiv",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Volkswagen, Türkiye'deki hükümet yanlısı kuruluşlarla yakın iş ilişkileri nedeniyle eleştirilmiştir. Şirketin insan hakları ve demokrasi konusundaki endişelere rağmen Türkiye'de fabrika kurma kararı, hükümetin tartışmalı politikalarını meşrulaştırdığı şeklinde yorumlanmıştır.",
    alternativeCompanies: ["Renault", "Honda", "Toyota"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "16",
    name: "Audi",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/800px-Audi-Logo_2016.svg.png",
    category: "Otomotiv",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Volkswagen Grubu'nun bir parçası olan Audi, aynı nedenlerle boykot edilmektedir - hükümet yanlısı kuruluşlarla iş bağlantıları ve Türkiye'deki demokratik gerilemeye karşı tavır almaması. Lüks otomobil markası özellikle hükümet ile bağlantılı iş elitleri arasında popülerdir.",
    alternativeCompanies: ["BMW", "Volvo", "Lexus"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "17",
    name: "Skoda",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Skoda_Auto_logo.svg/800px-Skoda_Auto_logo.svg.png",
    category: "Araba",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Volkswagen Grubu'nun bir diğer yan kuruluşu olan Skoda, grubun Türk hükümetinin politikalarını desteklediği veya meşrulaştırdığı görünen iş kararları nedeniyle boykot listesine dahil edilmiştir. Şirket, kârı demokratik ilkelerin önüne koymakla eleştirilmiştir.",
    alternativeCompanies: ["Renault", "Hyundai", "Kia"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "18",
    name: "Günaydın Restoran",
    logo: "https://gunaydin.com.tr/wp-content/uploads/2023/10/png_d-1.png",
    category: "Restoran",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Günaydın Restoran, AKP hükümetini destekleyen iş gruplarıyla bağlantılıdır. Restoran zincirinin sahiplerinin hükümet yanlısı davalara önemli finansal katkılarda bulunduğu ve iş genişlemelerinde hükümet bağlantılarından yararlandığı bildirilmiştir.",
    alternativeCompanies: ["Big Chefs", "Köfteci Yusuf", "Hünkar"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "19",
    name: "Nusr-ET",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Nusr-Et_Logo.svg/800px-Nusr-Et_Logo.svg.png",
    category: "Restoran",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Ünlü şef Salt Bae (Nusret Gökçe) tarafından işletilen Nusr-ET, sahibinin Cumhurbaşkanı Erdoğan'a açık desteği ve hükümet yetkilileriyle yakın bağları nedeniyle eleştirilmiştir. Restoranın bu bağlantılar sayesinde izin ve düzenlemelerde ayrıcalıklı muamele gördüğü iddia edilmektedir.",
    alternativeCompanies: ["Divan", "Big Chefs", "Güler Kasap"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "20",
    name: "İhlas Ev Aletleri",
    logo: "https://www.ihlas.com.tr/assets/images/logo.png",
    category: "Elektronik",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "İhlas Ev Aletleri, AKP hükümetiyle güçlü bağları olan İhlas Holding'in bir parçasıdır. Şirketin medya kolları tutarlı bir şekilde hükümet yanlısı içerik üretirken, iş operasyonları da hükümet sözleşmelerinden ve elverişli düzenlemelerden yararlanmıştır.",
    alternativeCompanies: ["Arçelik", "Vestel", "Profilo"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "21",
    name: "İhlas Haber Ajansı (İHA)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c2/%C4%B0hlas_Haber_Ajans%C4%B1_logo.png",
    category: "Medya/Haber Ajansı",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "İhlas Haber Ajansı (İHA), haber yayınlamada hükümet yanlısı duruşuyla tanınmaktadır. İhlas Holding'in bir parçası olarak, muhalefet faaliyetlerini ve hükümet politikalarına karşı protestoları en aza indirirken veya yanlış temsil ederken iktidar partisini destekleyen içerikler üretmektedir.",
    alternativeCompanies: ["Bianet", "T24", "Diken"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "22",
    name: "Turkuaz Medya Grubu",
    logo: "https://upload.wikimedia.org/wikipedia/tr/c/c2/Turkuvaz_Medya_Grubu.png",
    category: "Medya/Haber Ajansı",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Turkuaz Medya Grubu, Cumhurbaşkanı Erdoğan'ın damadı olan eski Maliye Bakanı Berat Albayrak'ın kardeşi Serhat Albayrak'a aittir. ATV ve Sabah gazetesi dahil olmak üzere, medya grubu tutarlı bir şekilde hükümet yanlısı içerik üretmekte ve muhalefet figürlerini hedef almaktadır.",
    alternativeCompanies: ["Sözcü Medya", "Cumhuriyet Medya", "BirGün Medya"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "23",
    name: "Demirören Haber Ajansı (DHA)",
    logo: "https://upload.wikimedia.org/wikipedia/tr/0/0f/Demir%C3%B6ren_Haber_Ajans%C4%B1_logo.png",
    category: "Medya/Haber Ajansı",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Demirören Haber Ajansı (DHA), hükümet bağlantılı krediler yardımıyla daha önce bağımsız olan çeşitli medya kuruluşlarını satın alan Demirören Grubu'nun bir parçasıdır. Ajansın haber kapsamı tutarlı bir şekilde hükümet anlatısını desteklemekte ve siyasi açıdan hassas konularda öz-sansür uygulamakla eleştirilmektedir.",
    alternativeCompanies: ["Bianet", "T24", "Medyascope"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "24",
    name: "Türk Petrol",
    logo: "https://www.turkpetrol.com.tr/img/logo.png",
    category: "Petrol/Yakıt",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Türk Petrol, AKP hükümetini destekleyen iş gruplarıyla bağlantıları nedeniyle belirlenmiştir. Şirketin lisanslama ve düzenlemelerde avantajlı muamele gördüğü, liderliğinin ise demokratik normları zayıflattığı eleştirilen hükümet politikalarını açıkça desteklediği bildirilmiştir.",
    alternativeCompanies: ["Opet", "Aytemiz", "BP"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "25",
    name: "Milli Piyango",
    logo: "https://upload.wikimedia.org/wikipedia/tr/c/c7/Milli_Piyango_%C4%B0daresi_logo.png",
    category: "Şans Oyunları",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Milli Piyango'nun işletme hakları, hükümet yanlısı bir holding olan Demirören Holding liderliğindeki bir konsorsiyuma devredilmiştir. Özelleştirme süreci şeffaflık ve adam kayırma konularında endişeler yaratmış, eleştirmenler anlaşmanın hükümet yanlısı iş çıkarlarına fayda sağlamak üzere yapılandırıldığını öne sürmüştür.",
    alternativeCompanies: ["EuroLotto", "EuroMillions", "The Lotter"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "26",
    name: "Misli.com",
    logo: "https://upload.wikimedia.org/wikipedia/tr/2/29/Misli.com_logo.png",
    category: "Bahis",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "Misli.com, hükümete yakın şirketler tarafından yürütülen bahis operasyonlarının bir parçasıdır. Online bahis platformu, AKP politikalarını destekleyen ve bunlardan faydalanan iş gruplarıyla bağlantıları nedeniyle eleştirilmiş, hükümet yanlısı şirketlerin düzenlenmiş endüstrilere hakim olduğu bir sisteme katkıda bulunduğu öne sürülmüştür.",
    alternativeCompanies: ["Nesine.com", "Bilyoner", "Oley.com"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "27",
    name: "İddaa.com",
    logo: "https://www.iddaa.com/assets/images/iddaa-logo.svg",
    category: "Bahis",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "İddaa'nın işletme hakları da çok sayıda medya kuruluşuna sahip olan hükümet yanlısı Demirören Holding liderliğindeki bir konsorsiyuma verilmiştir. Süreç, şeffaflık eksikliği ve hükümet yanlısı iş gruplarının ekonomik etkisini daha da genişletmesi nedeniyle eleştirilmiştir.",
    alternativeCompanies: ["Nesine.com", "Bilyoner", "Oley.com"],
    link: "https://www.boykotyap.com"
  },
  {
    id: "28",
    name: "ETS Tur",
    logo: "https://upload.wikimedia.org/wikipedia/tr/f/fa/ETS_Tur_logo.png",
    category: "Turizm",
    reason: "Özgür Özel İlk Liste",
    startDate: "2025-03-29T00:00:00Z",
    description: "ETS Tur, Türkiye'nin Turizm Bakanı'yla bağlantılıdır ve Özgür Özel'in boykot çağrısında özellikle ismi geçmiştir. Seyahat şirketi, sektör düzenlemelerinde ve hükümet destekli turizm projelerine erişimde ayrıcalıklı muamele gördüğü iddia edilen yakın hükümet bağlantıları nedeniyle eleştirilmektedir.",
    alternativeCompanies: ["Jolly Tur", "Tatilsepeti", "Setur"],
    link: "https://www.boykotyap.com"
  }
];

/**
 * Uploads boycott companies data to Firestore
 * Can be called from anywhere in the app to populate the collection
 */
export const uploadBoycottCompaniesToFirestore = async (): Promise<boolean> => {
  try {
    console.log('Starting upload of boycott companies to Firestore...');
    
    // Process each company
    for (const company of boycottCompaniesData) {
      // Convert date string to JavaScript Date
      const processedCompany = { ...company };
      if (typeof processedCompany.startDate === 'string') {
        processedCompany.startDate = new Date(processedCompany.startDate);
      }
      
      // Use setDoc with a specific ID
      await setDoc(doc(firestore, 'boycottCompanies', company.id), {
        ...processedCompany,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    console.log(`✅ Successfully added ${boycottCompaniesData.length} companies to 'boycottCompanies' collection`);
    return true;
  } catch (error) {
    console.error('Error uploading boycott companies data:', error);
    return false;
  }
};

/**
 * Utility function to check if data needs to be uploaded
 * Prevents duplicate uploads
 */
export const checkAndUploadBoycottCompaniesIfNeeded = async (): Promise<void> => {
  // Here you could add logic to check if the collection already has data
  // For now, this is a placeholder for future implementation
  try {
    // Implementation would go here
    // For example, check collection count before uploading
    // For now, just call the upload function directly
    await uploadBoycottCompaniesToFirestore();
  } catch (error) {
    console.error('Error checking boycott companies data:', error);
  }
}; 