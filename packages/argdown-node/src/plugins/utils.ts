import axios from "axios";
import { promises as fs } from "fs";
import path from "path";
import process from "process";

export const imageUtils = {
  getImage: async (imagePath: string, baseDir: string = "") => {
    let buffer: Buffer | null;
    if (imagePath.startsWith("https:")) {
      // for security reasons, we don't support http
      buffer = await imageUtils.getRemoteImage(imagePath);
    } else {
      try {
        const resolvedPath = path.resolve(baseDir || process.cwd(), imagePath);
        //await fs.access(resolvedPath, constants.F_OK | constants.R_OK);
        buffer = await fs.readFile(resolvedPath);
      } catch (err) {
        buffer = await imageUtils.getRemoteImage(imagePath);
      }
    }
    return buffer;
  },
  getRemoteImage: async (path: string) => {
    const response = await axios.get(path, {
      responseType: "arraybuffer"
    });
    return Buffer.from(response.data, "binary");
  }
};
