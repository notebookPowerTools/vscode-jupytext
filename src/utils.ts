import * as tmp from 'tmp';
import * as path from 'path';

export function tempFile(options: { extension: string, prefix?:string }) {
    return new Promise<string>((resolve, reject) => {
        tmp.tmpName(
            { postfix: path.extname(options.extension), prefix:options.prefix },

            (err: Error | null, name: string) => {
                if (err) {
                    return reject(err);
                }
                name = name.endsWith(options.extension) ? name : name + options.extension;
                resolve(name);
            }
        );
    });
}
