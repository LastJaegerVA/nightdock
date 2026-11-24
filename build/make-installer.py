#!/usr/bin/env python3
"""Builds the Nightdock Windows installer with NSIS (makensis), no Wine needed.

Usage: python3 build/make-installer.py <win-unpacked dir> <version> <output.exe>
Generates the exact file lists so the uninstaller removes only what was installed.
"""
import os
import subprocess
import sys
from pathlib import Path

SRC = Path(sys.argv[1]).resolve()
VERSION = sys.argv[2]
OUT = Path(sys.argv[3]).resolve()
BUILD = Path(__file__).resolve().parent
GEN = BUILD / "nsis-gen"
GEN.mkdir(exist_ok=True)

# ── file lists ──────────────────────────────────────────────────────────
dirs, inst, uninst = set(), [], []
by_dir = {}
for p in sorted(SRC.rglob("*")):
    if p.is_file():
        rel = p.relative_to(SRC)
        by_dir.setdefault(str(rel.parent), []).append(p)
for d in sorted(by_dir):
    win_d = "" if d == "." else "\\" + d.replace("/", "\\")
    inst.append(f'  SetOutPath "$INSTDIR{win_d}"')
    for p in by_dir[d]:
        inst.append(f'  File "{p}"')
        uninst.append(f'  Delete "$INSTDIR{win_d}\\{p.name}"')
    if d != ".":
        parts = Path(d).parts
        for i in range(1, len(parts) + 1):
            dirs.add("\\".join(parts[:i]))
for d in sorted(dirs, key=lambda x: -x.count("\\")):
    uninst.append(f'  RMDir "$INSTDIR\\{d}"')
(GEN / "install-files.nsh").write_text("\n".join(inst) + "\n", encoding="utf-8")
(GEN / "uninstall-files.nsh").write_text("\n".join(uninst) + "\n", encoding="utf-8")

# ── translations ────────────────────────────────────────────────────────
LANGS = {
    "ENGLISH": {
        "WelcomeTitle": "Welcome to Nightdock",
        "WelcomeText": "Nightdock puts Steam, Ubisoft Connect, Epic and all your other game launchers in one place.$\\r$\\n$\\r$\\nThis will install Nightdock ${VERSION} for your user account. You don't need administrator rights.$\\r$\\n$\\r$\\nClick Next to continue.",
        "SecStart": "Start menu shortcut", "SecDesk": "Desktop shortcut",
        "DescApp": "The Nightdock app itself.", "DescStart": "Find Nightdock in the Start menu.", "DescDesk": "Put a Nightdock icon on your desktop.",
        "RunText": "Open Nightdock now",
        "NeedWin10": "Nightdock needs 64-bit Windows 10 or newer.",
        "UnData": "My launchers and settings",
        "UnDescApp": "Removes the Nightdock app.",
        "UnDescData": "Also delete your saved launchers, themes and settings. Leave this unticked to keep them in case you reinstall.",
    },
    "NORWEGIAN": {
        "WelcomeTitle": "Velkommen til Nightdock",
        "WelcomeText": "Nightdock samler Steam, Ubisoft Connect, Epic og alle de andre spill-launcherne dine på ett sted.$\\r$\\n$\\r$\\nNightdock ${VERSION} blir installert for brukerkontoen din. Du trenger ikke administratorrettigheter.$\\r$\\n$\\r$\\nKlikk Neste for å fortsette.",
        "SecStart": "Snarvei på Start-menyen", "SecDesk": "Snarvei på skrivebordet",
        "DescApp": "Selve Nightdock-appen.", "DescStart": "Finn Nightdock på Start-menyen.", "DescDesk": "Legg et Nightdock-ikon på skrivebordet.",
        "RunText": "Åpne Nightdock nå",
        "NeedWin10": "Nightdock krever 64-biters Windows 10 eller nyere.",
        "UnData": "Launcherne og innstillingene mine",
        "UnDescApp": "Fjerner Nightdock-appen.",
        "UnDescData": "Slett også lagrede launchere, temaer og innstillinger. La boksen stå tom for å beholde dem i tilfelle du installerer på nytt.",
    },
    "SWEDISH": {
        "WelcomeTitle": "Välkommen till Nightdock",
        "WelcomeText": "Nightdock samlar Steam, Ubisoft Connect, Epic och alla dina andra spel-launchers på ett ställe.$\\r$\\n$\\r$\\nNightdock ${VERSION} installeras för ditt användarkonto. Du behöver inga administratörsrättigheter.$\\r$\\n$\\r$\\nKlicka på Nästa för att fortsätta.",
        "SecStart": "Genväg på Start-menyn", "SecDesk": "Genväg på skrivbordet",
        "DescApp": "Själva Nightdock-appen.", "DescStart": "Hitta Nightdock på Start-menyn.", "DescDesk": "Lägg en Nightdock-ikon på skrivbordet.",
        "RunText": "Öppna Nightdock nu",
        "NeedWin10": "Nightdock kräver 64-bitars Windows 10 eller senare.",
        "UnData": "Mina launchers och inställningar",
        "UnDescApp": "Tar bort Nightdock-appen.",
        "UnDescData": "Radera även sparade launchers, teman och inställningar. Lämna rutan tom för att behålla dem om du installerar igen.",
    },
    "DANISH": {
        "WelcomeTitle": "Velkommen til Nightdock",
        "WelcomeText": "Nightdock samler Steam, Ubisoft Connect, Epic og alle dine andre spil-launchere ét sted.$\\r$\\n$\\r$\\nNightdock ${VERSION} installeres til din brugerkonto. Du behøver ikke administratorrettigheder.$\\r$\\n$\\r$\\nKlik på Næste for at fortsætte.",
        "SecStart": "Genvej i menuen Start", "SecDesk": "Genvej på skrivebordet",
        "DescApp": "Selve Nightdock-appen.", "DescStart": "Find Nightdock i menuen Start.", "DescDesk": "Læg et Nightdock-ikon på skrivebordet.",
        "RunText": "Åbn Nightdock nu",
        "NeedWin10": "Nightdock kræver 64-bit Windows 10 eller nyere.",
        "UnData": "Mine launchere og indstillinger",
        "UnDescApp": "Fjerner Nightdock-appen.",
        "UnDescData": "Slet også gemte launchere, temaer og indstillinger. Lad feltet være tomt for at beholde dem, hvis du geninstallerer.",
    },
    "GERMAN": {
        "WelcomeTitle": "Willkommen bei Nightdock",
        "WelcomeText": "Nightdock bringt Steam, Ubisoft Connect, Epic und alle deine anderen Spiele-Launcher an einen Ort.$\\r$\\n$\\r$\\nNightdock ${VERSION} wird für dein Benutzerkonto installiert. Du brauchst keine Administratorrechte.$\\r$\\n$\\r$\\nKlicke auf Weiter, um fortzufahren.",
        "SecStart": "Verknüpfung im Startmenü", "SecDesk": "Verknüpfung auf dem Desktop",
        "DescApp": "Die Nightdock-App selbst.", "DescStart": "Nightdock im Startmenü finden.", "DescDesk": "Ein Nightdock-Symbol auf dem Desktop ablegen.",
        "RunText": "Nightdock jetzt öffnen",
        "NeedWin10": "Nightdock benötigt 64-Bit-Windows 10 oder neuer.",
        "UnData": "Meine Launcher und Einstellungen",
        "UnDescApp": "Entfernt die Nightdock-App.",
        "UnDescData": "Auch gespeicherte Launcher, Designs und Einstellungen löschen. Lass das Kästchen leer, um sie für eine Neuinstallation zu behalten.",
    },
    "FRENCH": {
        "WelcomeTitle": "Bienvenue dans Nightdock",
        "WelcomeText": "Nightdock réunit Steam, Ubisoft Connect, Epic et tous vos autres launchers de jeux au même endroit.$\\r$\\n$\\r$\\nNightdock ${VERSION} va être installé pour votre compte utilisateur. Aucun droit administrateur n'est nécessaire.$\\r$\\n$\\r$\\nCliquez sur Suivant pour continuer.",
        "SecStart": "Raccourci dans le menu Démarrer", "SecDesk": "Raccourci sur le Bureau",
        "DescApp": "L'application Nightdock elle-même.", "DescStart": "Retrouvez Nightdock dans le menu Démarrer.", "DescDesk": "Placer une icône Nightdock sur le Bureau.",
        "RunText": "Ouvrir Nightdock maintenant",
        "NeedWin10": "Nightdock nécessite Windows 10 64 bits ou une version plus récente.",
        "UnData": "Mes launchers et paramètres",
        "UnDescApp": "Supprime l'application Nightdock.",
        "UnDescData": "Supprimer aussi les launchers, thèmes et paramètres enregistrés. Laissez décoché pour les conserver en cas de réinstallation.",
    },
    "SPANISH": {
        "WelcomeTitle": "Te damos la bienvenida a Nightdock",
        "WelcomeText": "Nightdock reúne Steam, Ubisoft Connect, Epic y todos tus demás launchers de juegos en un solo lugar.$\\r$\\n$\\r$\\nSe instalará Nightdock ${VERSION} para tu cuenta de usuario. No necesitas permisos de administrador.$\\r$\\n$\\r$\\nHaz clic en Siguiente para continuar.",
        "SecStart": "Acceso directo en el menú Inicio", "SecDesk": "Acceso directo en el escritorio",
        "DescApp": "La aplicación Nightdock.", "DescStart": "Encuentra Nightdock en el menú Inicio.", "DescDesk": "Pon un icono de Nightdock en el escritorio.",
        "RunText": "Abrir Nightdock ahora",
        "NeedWin10": "Nightdock necesita Windows 10 de 64 bits o posterior.",
        "UnData": "Mis launchers y ajustes",
        "UnDescApp": "Elimina la aplicación Nightdock.",
        "UnDescData": "Borra también los launchers, temas y ajustes guardados. Déjalo sin marcar para conservarlos si vuelves a instalar.",
    },
    "PORTUGUESEBR": {
        "WelcomeTitle": "Bem-vindo ao Nightdock",
        "WelcomeText": "O Nightdock reúne a Steam, o Ubisoft Connect, a Epic e todos os seus outros launchers de jogos em um só lugar.$\\r$\\n$\\r$\\nO Nightdock ${VERSION} será instalado para a sua conta de usuário. Você não precisa de permissões de administrador.$\\r$\\n$\\r$\\nClique em Avançar para continuar.",
        "SecStart": "Atalho no menu Iniciar", "SecDesk": "Atalho na área de trabalho",
        "DescApp": "O próprio aplicativo Nightdock.", "DescStart": "Encontre o Nightdock no menu Iniciar.", "DescDesk": "Coloque um ícone do Nightdock na área de trabalho.",
        "RunText": "Abrir o Nightdock agora",
        "NeedWin10": "O Nightdock precisa do Windows 10 de 64 bits ou mais recente.",
        "UnData": "Meus launchers e configurações",
        "UnDescApp": "Remove o aplicativo Nightdock.",
        "UnDescData": "Apaga também os launchers, temas e configurações salvos. Deixe desmarcado para mantê-los caso reinstale.",
    },
}
sys.path.insert(0, str(BUILD))
from installer_strings_more import merged, NSIS_NAMES  # noqa: E402
LANGS.update(merged())
(GEN / "languages.nsh").write_text("".join(f'!insertmacro MUI_LANGUAGE "{n}"\n' for n in NSIS_NAMES.values()), encoding="utf-8")
lang_lines = []
for lang, strings in LANGS.items():
    for k, v in strings.items():
        v = v.replace('"', '$\\"')
        lang_lines.append(f'LangString {k} ${{LANG_{lang}}} "{v}"')
(GEN / "strings.nsh").write_text("\n".join(lang_lines) + "\n", encoding="utf-8")

# ── run makensis ────────────────────────────────────────────────────────
cmd = ["makensis", "-V2", f"-DVERSION={VERSION}", f"-DOUTFILE={OUT}", str(BUILD / "installer.nsi")]
r = subprocess.run(cmd, cwd=BUILD)
sys.exit(r.returncode)
