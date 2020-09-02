import { AsyncArgdownApplication } from "@argdown/node";
import importGlobal from "import-global";

let triedToInstallImageExport = false;
let imageExportInstalled = false;
export const tryToInstallImageExport = async (
  argdown: AsyncArgdownApplication
) => {
  if (triedToInstallImageExport) {
    return imageExportInstalled;
  }
  triedToInstallImageExport = true;
  try {
    //@ts-ignore
    const { installImageExport } = await import("@argdown/image-export");
    installImageExport(argdown);
    imageExportInstalled = true;
  } catch (e) {
    try {
      const { installImageExport } = importGlobal("@argdown/image-export");
      installImageExport(argdown);
      imageExportInstalled = true;
    } catch (e) {
    }
  }
  return imageExportInstalled;
};
