# Wallet Card (PKPass JWT)

Jak utworzyć kartę lojalnościową jak ma IKEA Family, ktorą można wstawić do portfela Apple i Google?

Tworzenie karty lojalnościowej, która działa jak IKEA Family i może być dodana do Apple Wallet i Google Wallet, wymaga kilku kroków, które obejmują projektowanie, programowanie, oraz integrację z platformami mobilnymi. Oto szczegółowy plan:

---

### **1. Projekt i funkcjonalności karty**
Zdefiniuj, jakie funkcje powinna spełniać karta:
- Identyfikacja użytkownika (np. numer członkowski, kod QR/Barcode).
- Oferta specjalna (np. rabaty, punkty lojalnościowe).
- Powiadomienia o promocjach.
- Możliwość dodania karty do Apple Wallet i Google Wallet.

Przygotuj projekt graficzny karty:
- Rozmiar i układ zgodny z wytycznymi Apple Wallet i Google Wallet.
- Logo firmy i kluczowe informacje (nazwa programu, numer członkowski, kod QR/Barcode).

---

### **2. Wybór technologii i narzędzi**
#### Apple Wallet (PassKit):
- **PassKit**: Apple udostępnia framework PassKit, który umożliwia tworzenie plików `.pkpass` dla kart lojalnościowych.
- **Plik .pkpass** zawiera:
  - Plik manifestu (`manifest.json`).
  - Plik konfiguracji karty (`pass.json`).
  - Pliki graficzne (logo, tło, ikony).
  - Certyfikaty cyfrowe (do podpisania karty).

#### Google Wallet:
- Google Pay API for Passes:
  - Wymaga integracji z API Google do tworzenia cyfrowych kart lojalnościowych.
  - Wspiera format JSON Web Token (JWT), który przechowuje dane karty.

---

### **3. Proces tworzenia**
#### a) **Apple Wallet:**
1. **Zarejestruj się w Apple Developer Program**:
   - Wygeneruj certyfikaty do podpisywania kart (.p12).
2. **Stwórz plik `pass.json`**:
   Zawiera dane o karcie, np.:
   ```json
   {
     "formatVersion": 1,
     "passTypeIdentifier": "pass.com.twojafirma.loyalty",
     "teamIdentifier": "ABCDE12345",
     "organizationName": "Twoja Firma",
     "serialNumber": "123456789",
     "barcode": {
       "format": "PKBarcodeFormatQR",
       "message": "123456789",
       "messageEncoding": "iso-8859-1"
     }
   }
   ```
3. **Podpisz plik karty**:
   - Użyj certyfikatu, aby podpisać `.pkpass`.
   - Skorzystaj z narzędzi, takich jak `PassKit SDK` lub `OpenSSL`.
4. **Udostępnij kartę**:
   - Wygeneruj `.pkpass` i udostępnij go klientom (np. przez e-mail, aplikację mobilną).

#### b) **Google Wallet:**
1. **Zarejestruj się w Google Cloud Platform**:
   - Utwórz projekt i włącz API Google Wallet.
2. **Wygeneruj dane JWT**:
   - Stwórz dane karty w formacie JWT, np.:
     ```json
     {
       "iss": "email@twojafirma.com",
       "aud": "google",
       "typ": "loyalty_card",
       "payload": {
         "loyaltyClasses": [
           {
             "id": "loyalty-class-id",
             "issuerName": "Twoja Firma",
             "programName": "Program Lojalnościowy",
             "cardNumber": "123456789"
           }
         ]
       }
     }
     ```
3. **Przetestuj i wdroż kartę**:
   - Skorzystaj z API, aby generować i wysyłać karty do klientów.

---

### **4. Integracja z aplikacją lub stroną**
1. **Aplikacja mobilna**:
   - Dodaj funkcjonalność generowania i przesyłania kart w aplikacji.
   - Użyj PassKit (iOS) lub Google Pay API (Android).
2. **Strona internetowa**:
   - Udostępnij linki „Dodaj do Apple Wallet” i „Dodaj do Google Wallet”.

---

### **5. Testy i certyfikacja**
- Przetestuj karty na różnych urządzeniach.
- Sprawdź zgodność z wytycznymi Apple i Google.

---

### **6. Wdrożenie i marketing**
- Promuj kartę lojalnościową wśród klientów.
- Zapewnij łatwy dostęp do dodania kart (np. w mailach, aplikacjach, na stronie www).

---

Ale jak IKEA ma to zautomatyzowane, że wydaje te karty dla milionów klientów?

Automatyzacja wydawania kart lojalnościowych na masową skalę, jak w przypadku IKEA Family, wymaga odpowiedniego systemu backendowego, który może dynamicznie generować i udostępniać karty dla milionów użytkowników. Oto kluczowe elementy takiego systemu:

---

### **1. System zarządzania użytkownikami**
IKEA używa centralnego systemu CRM (Customer Relationship Management), który:
- Przechowuje dane klientów, takie jak imię, nazwisko, e-mail, numer telefonu.
- Generuje unikalne identyfikatory użytkowników (np. numer karty lojalnościowej).
- Obsługuje różne kanały rejestracji: online, w sklepach, w aplikacjach.

---

### **2. Automatyczne generowanie kart**
#### **Dynamiczne generowanie kart Apple Wallet i Google Wallet:**
- System backendowy automatycznie tworzy karty na podstawie danych użytkownika.
- Proces odbywa się w czasie rzeczywistym:
  1. Klient rejestruje się w programie lojalnościowym.
  2. System generuje plik karty (`.pkpass` dla Apple Wallet lub JSON Web Token dla Google Wallet).
  3. Karta jest dostarczana w sposób dynamiczny poprzez e-mail, aplikację mobilną lub stronę internetową.

#### **Technologie używane:**
- **Apple Wallet (PassKit API)**: Backend integruje się z API PassKit, tworząc pliki `.pkpass`.
- **Google Pay API for Passes**: Używane do tworzenia kart w formacie JWT.
- **Szybkie bazy danych**: Systemy takie jak Redis czy MongoDB przechowują tymczasowe dane kart, aby zapewnić szybki dostęp.

---

### **3. System powiadomień i dystrybucji**
Po wygenerowaniu karty, IKEA dystrybuuje ją do użytkowników:
- **E-mail**: Linki „Dodaj do Apple Wallet” / „Dodaj do Google Wallet” są wysyłane w e-mailu.
- **Aplikacja mobilna**:
  - Karta może być automatycznie dodana do Apple Wallet/Google Wallet za pomocą funkcji wbudowanej w aplikację.
  - Klient ma także dostęp do karty w aplikacji w formie kodu QR.
- **Strona internetowa**:
  - Po rejestracji klient może pobrać kartę z dedykowanego panelu użytkownika.

---

### **4. Skalowalność**
Automatyzacja na masową skalę wymaga skalowalnego systemu:
- **Chmura obliczeniowa**:
  - IKEA prawdopodobnie korzysta z chmury, takiej jak AWS, Google Cloud, czy Azure, aby obsłużyć duże obciążenia.
- **Serverless architecture**:
  - Funkcje serverless (np. AWS Lambda, Google Cloud Functions) generują karty w locie bez potrzeby utrzymywania serwerów.
- **Load Balancers**:
  - Systemy równoważenia obciążenia zapewniają płynne działanie przy dużej liczbie użytkowników.

---

### **5. Bezpieczeństwo i autentyczność**
1. **Certyfikaty cyfrowe**:
   - Apple wymaga certyfikatu Pass Type ID, który musi być aktualizowany i podpisywany dla każdej wygenerowanej karty.
   - Google używa kluczy do podpisywania JWT.
2. **Szyfrowanie danych**:
   - Dane użytkowników oraz wygenerowane karty są przechowywane w sposób bezpieczny (np. AES-256).
3. **Unikalność kart**:
   - Każda karta ma unikalny numer identyfikacyjny, np. UUID.

---

### **6. Personalizacja i aktualizacja karty**
IKEA może aktualizować treść karty w czasie rzeczywistym:
- **Aktualizacja ofert**: Nowe promocje, punkty lojalnościowe lub rabaty.
- **Powiadomienia push**: Apple Wallet i Google Wallet pozwalają wysyłać powiadomienia związane z kartą.
- **Dynamiczne zmiany**: Kolory, zdjęcia, czy treści karty mogą być zmieniane w backendzie.

---

### **7. Analiza danych**
System zbiera dane na temat:
- Liczby użytkowników korzystających z kart.
- Aktywności klientów (np. ile osób dodało kartę do portfela).
- Efektywności promocji powiązanych z kartą.

Dzięki temu IKEA może optymalizować działania marketingowe i ulepszać swój program lojalnościowy.

---

### **Przykład procesu IKEA:**
1. Klient rejestruje się online.
2. System generuje unikalny numer członkowski i przypisuje go do użytkownika.
3. Karta jest generowana automatycznie i wysyłana w formie linku do dodania w Apple Wallet/Google Wallet.
4. Klient dodaje kartę jednym kliknięciem.

Taka automatyzacja minimalizuje czas i koszty obsługi, umożliwiając wydawanie kart dla milionów klientów w ciągu sekund.

---

Napisz w PHP taki system backend, który tworzy kartę na podstawie danych z pliku JSON.

Oto przykład prostego systemu backendowego w PHP, który generuje kartę lojalnościową w formacie Apple Wallet (`.pkpass`) lub Google Wallet (JWT), na podstawie danych z pliku JSON. W tym przykładzie zakładamy, że plik JSON zawiera podstawowe dane użytkownika, takie jak imię, nazwisko, numer karty i e-mail.

### **Struktura projektu**
```
/project
    /certificates
        certificate.pem        # Certyfikat PassKit dla Apple Wallet
        key.pem                # Klucz prywatny PassKit
    /output
        card.pkpass            # Wygenerowana karta Apple Wallet
    /data
        user_data.json         # Dane użytkownika
    generate_card.php          # Główny plik PHP
```

---

### **Plik `generate_card.php`**

```php
<?php
// Konfiguracja
define('PASSKIT_CERT_PATH', __DIR__ . '/certificates/certificate.pem');
define('PASSKIT_KEY_PATH', __DIR__ . '/certificates/key.pem');
define('PASSKIT_KEY_PASSWORD', 'your_password'); // Zmień na hasło klucza
define('OUTPUT_DIR', __DIR__ . '/output/');

// Funkcja do generowania karty Apple Wallet
function generateAppleWalletCard($userData) {
    $passData = [
        "formatVersion" => 1,
        "passTypeIdentifier" => "pass.com.example.loyalty",
        "teamIdentifier" => "ABCDE12345",
        "organizationName" => "Twoja Firma",
        "serialNumber" => $userData['card_number'],
        "barcode" => [
            "format" => "PKBarcodeFormatQR",
            "message" => $userData['card_number'],
            "messageEncoding" => "iso-8859-1"
        ],
        "backgroundColor" => "rgb(255,255,255)",
        "labelColor" => "rgb(0,0,0)",
        "logoText" => "Twoja Firma",
        "fields" => [
            [
                "key" => "name",
                "label" => "Imię i nazwisko",
                "value" => $userData['name']
            ]
        ]
    ];

    // Utwórz folder tymczasowy
    $tempDir = OUTPUT_DIR . uniqid('card_', true);
    mkdir($tempDir);

    // Zapisz plik pass.json
    file_put_contents("$tempDir/pass.json", json_encode($passData, JSON_PRETTY_PRINT));

    // Dodaj logo (jeśli istnieje)
    $logoPath = __DIR__ . '/certificates/logo.png'; // Dodaj logo
    if (file_exists($logoPath)) {
        copy($logoPath, "$tempDir/logo.png");
    }

    // Stwórz manifest i podpisz go
    $manifestContent = [];
    foreach (scandir($tempDir) as $file) {
        if ($file === '.' || $file === '..') continue;
        $filePath = "$tempDir/$file";
        $manifestContent[$file] = sha1_file($filePath);
    }
    file_put_contents("$tempDir/manifest.json", json_encode($manifestContent));

    // Podpisz manifest
    $signature = null;
    openssl_pkcs7_sign(
        "$tempDir/manifest.json",
        "$tempDir/manifest.json.sig",
        file_get_contents(PASSKIT_CERT_PATH),
        [
            file_get_contents(PASSKIT_KEY_PATH),
            PASSKIT_KEY_PASSWORD
        ],
        [],
        PKCS7_BINARY
    );
    rename("$tempDir/manifest.json.sig", "$tempDir/signature");

    // Spakuj pliki do .pkpass
    $zip = new ZipArchive();
    $pkpassPath = OUTPUT_DIR . "{$userData['card_number']}.pkpass";
    if ($zip->open($pkpassPath, ZipArchive::CREATE) === TRUE) {
        foreach (scandir($tempDir) as $file) {
            if ($file === '.' || $file === '..') continue;
            $zip->addFile("$tempDir/$file", $file);
        }
        $zip->close();
    }

    // Usuń pliki tymczasowe
    array_map('unlink', glob("$tempDir/*"));
    rmdir($tempDir);

    return $pkpassPath;
}

// Wczytaj dane użytkownika z pliku JSON
$userDataPath = __DIR__ . '/data/user_data.json';
if (!file_exists($userDataPath)) {
    die("Plik JSON nie istnieje.");
}
$userData = json_decode(file_get_contents($userDataPath), true);

// Generuj kartę dla użytkownika
if ($userData) {
    $cardPath = generateAppleWalletCard($userData);
    echo "Karta została wygenerowana: $cardPath";
} else {
    echo "Błąd podczas odczytu danych użytkownika.";
}
?>
```

---

### **Przykładowy plik `user_data.json`**

```json
{
    "name": "Jan Kowalski",
    "card_number": "123456789",
    "email": "jan.kowalski@example.com"
}
```

---

### **Jak działa system**
1. **Certyfikaty**:
   - Umieść certyfikat PassKit i klucz prywatny w folderze `certificates`.
   - Upewnij się, że certyfikat jest prawidłowo skonfigurowany.

2. **Generowanie karty**:
   - Uruchom skrypt PHP: `php generate_card.php`.
   - Skrypt odczyta dane z pliku `user_data.json`, wygeneruje kartę i zapisze ją w folderze `output`.

3. **Testowanie**:
   - Plik `.pkpass` można przetestować na urządzeniach Apple, wysyłając go e-mailem lub przez stronę internetową.

4. **Rozbudowa**:
   - Dodaj obsługę Google Wallet (JWT).
   - Dodaj interfejs do ładowania danych użytkowników dynamicznie, np. przez API.

---

Daj znać, jeśli potrzebujesz rozszerzenia o dodatkowe funkcje, takie jak generowanie kart Google Wallet!