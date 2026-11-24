# Changelog

## 1.3.4 — 2026-11-24

- The author and publisher name is now LastJaegerVA (installer, app details, Linux packages, license).

## 1.3.3

- The Fedora/openSUSE `.rpm` package is back in the release.

## 1.3.2

- One pacman command for CachyOS, Arch and Manjaro, using a download link that always points
  to the newest version.
- Every release also has version-free file names (`Nightdock-Setup.exe`,
  `nightdock-x86_64.pkg.tar.xz`, `nightdock_amd64.deb`, `Nightdock-x86_64.AppImage`).
- Fedora/openSUSE `.rpm` builds again.
- `install.sh` falls back to the AppImage when a release has no package for your system.
- Releases are published automatically when the version number goes up.

## 1.3.1

- One-command Linux install: `install.sh` downloads the newest release and installs the right
  package for your system (pacman, apt, dnf/zypper or AppImage).
- Clearer install steps in the README.
- Fixed the GitHub build so the Linux packages are published.

## 1.3.0

- 32 languages, picked automatically from your computer: added Icelandic, Finnish, Dutch,
  Italian, Polish, Czech, Hungarian, Romanian, Greek, Russian, Ukrainian, Turkish, Arabic,
  Hebrew, Persian, Hindi, Bengali, Thai, Vietnamese, Indonesian, Chinese (simplified and
  traditional), Japanese and Korean.
- Right-to-left layout for Arabic, Hebrew and Persian.
- Correct plural forms for every language.
- The Windows installer speaks 31 languages.
- One-command Linux install: `install.sh` picks the right package for your system.

## 1.2.0

- Languages: English, Norwegian, Swedish, Danish, German, French, Spanish and Brazilian Portuguese.
- New Windows installer: its own artwork, shortcut choices, opens Nightdock when done,
  removes the old Hangar version, no administrator rights needed. The uninstaller asks
  whether to keep your launchers and settings.

## 1.1.0

- Renamed from Hangar to Nightdock, with a new icon. Settings carry over automatically.
- 18 themes, with matching accent colours.

## 1.0.0

- First version: finds your game launchers, search, favourites, drag to reorder, grid and
  list views, custom launchers and icons, tray support, Windows and Linux builds.
