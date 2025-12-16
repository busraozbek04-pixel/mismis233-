# 📊 Grafana Eklentisi Geliştirme Projesi (Panel & Data Source)

Bu depo, bir öğrenci projesi olarak geliştirilmiş hem **Panel Eklentisi (`mismis233-acmesimple-panel`)** hem de **Data Source Eklentisi (`mismis233-acme-datasource`)** içerir. Proje, Grafana Eklentisi Geliştirme SDK'sı kullanılarak oluşturulmuş, canlı geliştirme (`Hot Reload`) desteğine sahiptir ve Docker üzerinde çalıştırılmaktadır.

## 🧑‍💻 Zorunlu Gereksinimler (Mandatory Requirement)

Projeyi başarılı kabul etmek için aşağıdaki zorunlu gereksinimler yerine getirilmiştir:

* Proje başarıyla derlenmiştir (`Build successfully`).
* Eklentiler Grafana içine yüklenmiştir (`Load inside Grafana`).
* Öğrencinin adı (`BUSRA OZBEK`), eklenti kullanıcı arayüzünde (`UI`) bir yerde gösterilmektedir.

## 🛠️ Kurulum Ön Gereksinimleri

Bu projeyi çalıştırmak için sisteminizde aşağıdaki araçların kurulu olması gerekir:

* **Node.js LTS** (18 veya 20)
* **npm** (Node.js ile birlikte gelir)
* **Git**
* **Docker Desktop** (Grafana geliştirme sunucusunu çalıştırmak için gereklidir)

## 🏗️ Proje Oluşturma ve Geliştirme Adımları

### Adım 1: Proje İskeletinin Oluşturulması

Eklentiler, `npx @grafana/create-plugin` komutu kullanılarak oluşturulmuştur:

* **Panel Eklentisi:** `Plugin Type: Panel` seçilerek oluşturulmuştur.
* **Data Source Eklentisi (Bonus):** `Plugin Type: Datasource` seçilerek oluşturulmuştur.

### Adım 2: Geliştirme Ortamını Başlatma (Çift Terminal Kullanımı)

Eklentiyi canlı geliştirmek için iki ayrı terminal penceresinin eş zamanlı olarak çalışması zorunludur.

| İşlem | Terminal | Komut | Açıklama |
| :--- | :--- | :--- | :--- |
| **Grafana Sunucusu** | Terminal 1 (Açık Kalmalı) | `npm run server` | Grafana'yı Docker üzerinde başlatır ve `http://localhost:3000` adresinde çalışır halde tutar. |
| **Geliştirme Sunucusu** | Terminal 2 (Yeni Terminal) | `npm run dev` | Kodu derler ve değişiklikleri izleyerek Hot Reload (Canlı Güncelleme) sağlar. |

### Adım 3: Kodu Düzenleme ve Gerekli Değişiklikler

* **`npm run dev`** komutu çalışırken, zorunlu gereksinimi karşılamak için ana UI dosyası düzenlenmiştir.
* **Panel Eklentisi için:** `src/components/SimplePanel.tsx` dosyası açılmış ve panelin `return` bloğuna öğrencinin adı eklenmiştir.
* **Data Source Eklentisi için:** `src/QueryEditor.tsx` gibi ilgili arayüz dosyasına öğrencinin adı eklenmiştir.

## 🌐 Eklentilerin Grafana'da Kullanımı

`npm run server` başarılı olduktan sonra `http://localhost:3000` adresine `admin/admin` bilgileriyle giriş yapılmalıdır.

### A. Panel Eklentisi (`mismis233-acmesimple-panel`) Kullanımı

1.  **Panoya Ekleme:** Dashboard oluşturulur ve **`+ Add visualization`** butonuna tıklanır.
2.  **Eklentiyi Seçme:** Sağdaki **Visualization** menüsünden **`Acme-Simple-Panel`** seçilir.
3.  **Sonuç:** Panelde, **BUSRA OZBEK** adı görünmelidir.

### B. Data Source Eklentisi (`mismis233-acme-datasource`) Kullanımı

1.  **Data Sources Sayfasına Gitme:** Sol menüden **Connections** $\to$ **Data sources** yolu izlenir.
2.  **Eklentiyi Bulma:** Listede **`acme-datasource`** bulunmalı ve tıklanmalıdır. (Data Source eklentileri burada listelenir, panel eklentileri değil.)

## 📦 Üretim İçin Derleme (Final Build)

Geliştirme süreci tamamlandığında, eklentinin optimize edilmiş ve dağıtıma hazır halini oluşturmak için kullanılır:

1.  **Geliştirme Sunucularını Durdurma:** Tüm terminal pencerelerinde çalışan `npm run server` ve `npm run dev` süreçleri `Ctrl+C` ile durdurulur.
2.  **Derleme Komutu:**
    ```bash
    npm run build
    ```
3.  **Çıktı:** Bu komut, nihai eklenti dosyalarını içeren **`dist/`** dizinini oluşturur. Bu dizin, başka bir Grafana örneğine kopyalanmaya hazırdır.