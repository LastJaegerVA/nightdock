#!/usr/bin/env bash
# Nightdock installer for Linux.
#
#   curl -fsSL https://raw.githubusercontent.com/LastJaegerVA/nightdock/main/install.sh | bash
#
# Downloads the newest release from GitHub and installs the right package:
#   Arch / CachyOS / Manjaro (pacman)   -> .pkg.tar.xz
#   Debian / Ubuntu / Mint (apt)        -> .deb
#   Fedora (dnf) / openSUSE (zypper)    -> .rpm
#   anything else                       -> AppImage in ~/.local/bin (no root needed)
#
# Choose a format yourself with:  NIGHTDOCK_FORMAT=appimage bash install.sh
# Remove Nightdock with:          bash install.sh --uninstall
set -euo pipefail

REPO="LastJaegerVA/nightdock"
API="${NIGHTDOCK_API:-https://api.github.com/repos/$REPO/releases/latest}"
FORMAT="${NIGHTDOCK_FORMAT:-}"
APPIMAGE_DIR="$HOME/.local/bin"
DESKTOP_FILE="$HOME/.local/share/applications/nightdock.desktop"
ICON_FILE="$HOME/.local/share/icons/hicolor/512x512/apps/nightdock.png"

say() { printf '\033[1;35m==>\033[0m %s\n' "$*" >&2; }
die() { printf '\033[1;31mError:\033[0m %s\n' "$*" >&2; exit 1; }

SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then SUDO="sudo"; elif command -v doas >/dev/null 2>&1; then SUDO="doas"; fi
fi

detect_format() {
  if [ -n "$FORMAT" ]; then echo "$FORMAT"; return; fi
  if command -v pacman >/dev/null 2>&1; then echo pacman
  elif command -v apt-get >/dev/null 2>&1; then echo deb
  elif command -v dnf >/dev/null 2>&1 || command -v zypper >/dev/null 2>&1; then echo rpm
  else echo appimage; fi
}

uninstall() {
  say "Removing Nightdock…"
  if command -v pacman >/dev/null 2>&1 && pacman -Q nightdock >/dev/null 2>&1; then $SUDO pacman -R nightdock; fi
  if command -v dpkg >/dev/null 2>&1 && dpkg -s nightdock >/dev/null 2>&1; then $SUDO apt-get remove -y nightdock; fi
  if command -v rpm >/dev/null 2>&1 && rpm -q nightdock >/dev/null 2>&1; then
    if command -v dnf >/dev/null 2>&1; then $SUDO dnf remove -y nightdock; else $SUDO zypper --non-interactive remove nightdock; fi
  fi
  rm -f "$APPIMAGE_DIR/Nightdock.AppImage" "$DESKTOP_FILE" "$ICON_FILE"
  say "Done. Your launchers and settings are still in ~/.config/Nightdock — delete that folder to remove them too."
  exit 0
}
[ "${1:-}" = "--uninstall" ] && uninstall

[ "$(uname -s)" = "Linux" ] || die "This installer is for Linux. On Windows, download the installer from https://github.com/$REPO/releases/latest"
[ "$(uname -m)" = "x86_64" ] || die "Nightdock is only built for 64-bit PCs (x86_64) so far."
command -v curl >/dev/null 2>&1 || die "curl is needed. Install it with your package manager, then run this again."

say "Looking up the newest Nightdock release…"
release=$(curl -fsSL -H "Accept: application/vnd.github+json" "$API") \
  || die "Couldn't reach GitHub. Check your internet connection, or download a file from https://github.com/$REPO/releases"
urls=$(printf '%s' "$release" | grep -o '"browser_download_url": *"[^"]*"' | sed 's/.*"\([^"]*\)"$/\1/' || true)
[ -n "$urls" ] || die "No release files found yet. Check https://github.com/$REPO/releases in a few minutes."
version=$(printf '%s' "$release" | grep -o '"tag_name": *"[^"]*"' | head -n1 | sed 's/.*"\([^"]*\)"$/\1/')

pick() {
  local url
  url=$(printf '%s\n' "$urls" | grep -E "$1" | head -n1 || true)
  [ -n "$url" ] || die "This release has no $2 file. Download another format from https://github.com/$REPO/releases"
  echo "$url"
}

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
fetch() {
  local url=$1 file="$tmp/${1##*/}"
  say "Downloading ${url##*/}…"
  curl -fL --progress-bar -o "$file" "$url" || die "Download failed: $url"
  echo "$file"
}

need_root() { [ -n "$SUDO" ] || [ "$(id -u)" -eq 0 ] || die "This needs administrator rights (sudo). Or run: NIGHTDOCK_FORMAT=appimage bash install.sh"; }

format=$(detect_format)
say "Installing Nightdock ${version:-} ($format)…"
case "$format" in
  pacman)
    need_root
    file=$(fetch "$(pick '\.pkg\.tar\.(xz|zst)$' 'Arch/pacman')")
    if pacman -Q hangar >/dev/null 2>&1; then say "Removing the old Hangar version…"; $SUDO pacman -R --noconfirm hangar; fi
    $SUDO pacman -U --noconfirm "$file"
    ;;
  deb)
    need_root
    file=$(fetch "$(pick '\.deb$' '.deb')")
    $SUDO apt-get install -y "$file"
    ;;
  rpm)
    need_root
    file=$(fetch "$(pick '\.rpm$' '.rpm')")
    if command -v dnf >/dev/null 2>&1; then $SUDO dnf install -y "$file"
    else $SUDO zypper --non-interactive install --allow-unsigned-rpm "$file"; fi
    ;;
  appimage)
    file=$(fetch "$(pick '\.AppImage$' 'AppImage')")
    mkdir -p "$APPIMAGE_DIR" "$(dirname "$DESKTOP_FILE")" "$(dirname "$ICON_FILE")"
    install -m 755 "$file" "$APPIMAGE_DIR/Nightdock.AppImage"
    curl -fsSL -o "$ICON_FILE" "https://raw.githubusercontent.com/$REPO/main/docs/icon.png" || true
    exec_line="$APPIMAGE_DIR/Nightdock.AppImage"
    # AppImages need libfuse2; without it they can still run by unpacking themselves.
    if ! ldconfig -p 2>/dev/null | grep -q 'libfuse.so.2'; then exec_line="env APPIMAGE_EXTRACT_AND_RUN=1 $exec_line"; fi
    cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Type=Application
Name=Nightdock
Comment=Every game launcher in one place
Exec=$exec_line %U
Icon=nightdock
Categories=Game;
StartupWMClass=Nightdock
EOF
    command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$(dirname "$DESKTOP_FILE")" >/dev/null 2>&1 || true
    ;;
  *) die "Unknown format '$format'. Use pacman, deb, rpm or appimage." ;;
esac

say "Nightdock is installed! Open it from your app menu."
