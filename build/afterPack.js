// Sets the Windows .exe icon and version info without needing Wine.
const fs = require('fs');
const path = require('path');
const ResEdit = require('resedit');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;
  const { productFilename, info } = context.packager.appInfo
    ? { productFilename: context.packager.appInfo.productFilename, info: context.packager.appInfo }
    : {};
  const exePath = path.join(context.appOutDir, `${productFilename}.exe`);
  const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath), { ignoreCert: true });
  const res = ResEdit.NtExecutableResource.from(exe);

  const ico = ResEdit.Data.IconFile.from(fs.readFileSync(path.join(__dirname, 'icon.ico')));
  const groups = ResEdit.Resource.IconGroupEntry.fromEntries(res.entries);
  const groupId = groups.length ? groups[0].id : 1;
  const lang = groups.length ? groups[0].lang : 1033;
  ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, groupId, lang, ico.icons.map((i) => i.data));

  const vers = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
  const v = vers[0] || ResEdit.Resource.VersionInfo.createEmpty();
  const [a, b, c] = info.version.split('.').map(Number);
  v.setFileVersion(a, b, c, 0, 1033);
  v.setProductVersion(a, b, c, 0, 1033);
  v.setStringValues({ lang: 1033, codepage: 1200 }, {
    FileDescription: 'Nightdock', ProductName: 'Nightdock', CompanyName: 'LastJaegerVA',
    InternalName: 'Nightdock', OriginalFilename: `${productFilename}.exe`,
    LegalCopyright: `Copyright © ${new Date().getFullYear()} Jonas Olsen-Sund (LastJaegerVA)`,
    FileVersion: info.version, ProductVersion: info.version,
  });
  v.outputToResourceEntries(res.entries);

  res.outputResource(exe);
  fs.writeFileSync(exePath, Buffer.from(exe.generate()));
  console.log('  • afterPack       set Windows icon + version info');
};
