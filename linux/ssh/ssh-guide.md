# Secure SHell (SSH) Guide

Created by [Krzysztof Przygoda](https://github.com/KrzysztofPrzygoda), 2021.

## Reference

## General

## SSH Keys

### View Keys
Before you create a key pair, check if a key pair already exists in your user home directory:

OS | Home
--- | ---
**Linux** | `/home/<username>/.ssh/`
**macOS** | `/Users/<username>/.ssh/`
**Windows 10** | `C:\Users\<username>\.ssh\`

See if a file with one of the following formats exists:

Algorithm | Public Key | Private Key
--- | --- | ---
**ED25519** (preferred) | `id_ed25519.pub` | `id_ed25519`
**RSA** (at least 2048-bit key size) | `id_rsa.pub` | `id_rsa`
**DSA** (deprecated) | `id_dsa.pub` | `id_dsa`
**ECDSA** | `id_ecdsa.pub` | `id_ecdsa`

### Create Keys
