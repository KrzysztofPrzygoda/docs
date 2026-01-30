#!/bin/bash

# Ustawienia
adres_serwera_zdalnego="adres_serwera_ftp"
uzytkownik_ftp="nazwa_uzytkownika_ftp"
haslo_ftp="haslo_ftp"
sciezka_zdalna="/sciezka/do/katalogu/zdalnego"
sciezka_lokalna="/sciezka/do/katalogu/lokalnego"
nazwa_bazy_danych="nazwa_bazy_danych"
uzytkownik_bazy_danych="uzytkownik_bazy_danych"
haslo_bazy_danych="haslo_bazy_danych"
plik_sql="dump.sql"
stary_url="stary_url"
nowy_url="nowy_url"

# Funkcja kopiowania plików przez FTP
kopiuj_pliki_ftp() {
    lftp -u $uzytkownik_ftp,$haslo_ftp $adres_serwera_zdalnego << EOF
    cd $sciezka_zdalna
    lcd $sciezka_lokalna
    mirror
    bye
EOF
}

# Funkcja kopiowania plików przez SSH
kopiuj_pliki_ssh() {
    scp -r user@$adres_serwera_zdalnego:$sciezka_zdalna $sciezka_lokalna
}

# Funkcja eksportu bazy danych
eksportuj_baze_danych() {
    ssh user@$adres_serwera_zdalnego "mysqldump -u $uzytkownik_bazy_danych -p$haslo_bazy_danych $nazwa_bazy_danych > $plik_sql"
}

# Funkcja modyfikacji wartości adresu URL w pliku SQL
zmien_adresy_url() {
    sed -i "s@$stary_url@$nowy_url@g" $sciezka_lokalna/$plik_sql
}

# Funkcja tworzenia bazy danych na serwerze lokalnym
utworz_baze_danych() {
    mysql -u $uzytkownik_bazy_danych -p$haslo_bazy_danych -e "CREATE DATABASE IF NOT EXISTS $nazwa_bazy_danych"
    mysql -u $uzytkownik_bazy_danych -p$haslo_bazy_danych $nazwa_bazy_danych < $sciezka_lokalna/$plik_sql
}

# Kopiowanie bazy danych
echo "Kopiowanie bazy danych..."
eksportuj_baze_danych && echo "Baza danych skopiowana pomyślnie." || { echo "Błąd kopiowania bazy danych."; exit 1; }

# Modyfikacja adresów URL w pliku SQL
echo "Modyfikowanie adresów URL..."
zmien_adresy_url && echo "Adresy URL zmodyfikowane pomyślnie." || { echo "Błąd modyfikowania adresów URL."; exit 1; }

# Tworzenie bazy danych na serwerze lokalnym
echo "Tworzenie bazy danych na serwerze lokalnym..."
utworz_baze_danych && echo "Baza danych utworzona pomyślnie." || { echo "Błąd tworzenia bazy danych."; exit 1; }

# Kopiowanie plików (wybór sposobu)
echo "Wybierz sposób transferu plików:"
echo "1. FTP"
echo "2. SSH"
read -p "Wybierz opcję (1 lub 2): " wybor_transferu

case $wybor_transferu in
    1) echo "Kopiowanie plików przez FTP..."
       kopiuj_pliki_ftp && echo "Pliki skopiowane pomyślnie." || echo "Błąd kopiowania plików przez FTP."
       ;;
    2) echo "Kopiowanie plików przez SSH..."
       kopiuj_pliki_ssh && echo "Pliki skopiowane pomyślnie." || echo "Błąd kopiowania plików przez SSH."
       ;;
    *) echo "Niepoprawny wybór." ;;
esac

echo "Proces zakończony."
