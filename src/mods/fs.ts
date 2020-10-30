const decode = TextDecoder.prototype.decode.bind(new TextDecoder);
const encode = TextEncoder.prototype.encode.bind(new TextEncoder);

const { os } = Deno.build;

export const resolve = (relativeURL: string) => {
	const url = new URL(
		relativeURL,
		new URL("../../", import.meta.url).href
	).href;

	return url.replace(
		"file://" +
		(os === "windows"
			? "/"
			: ""),
		""
	);
};

export async function exists(fileName: string): Promise<boolean> {
  let exists = false;

  try {
    const stats = await Deno.lstat(fileName);
    if (stats.isDirectory || stats.isFile) exists = true;
  } catch (e) {
    exists = false;
  }

  return exists;
}

export async function readFile(fileName: string): Promise<string | void> {
  const fileExists = await exists(fileName);
  if (!fileExists) return;

  return decode(await Deno.readFile(fileName)).replace(/\r/g, "");
}

export async function writeFile(fileName: string, data: string, options?: Deno.WriteFileOptions): Promise<void> {
  await Deno.writeFile(fileName, encode(data), options);
}