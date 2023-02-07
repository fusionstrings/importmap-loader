import { get } from 'node:https';
import { ImportMap } from '@jspm/import-map';
import importmap from './node.importmap.json' assert { type: 'json' };

function resolve(specifier, context, nextResolve) {
    try {
        const mapUrl = import.meta.url;

        const map = new ImportMap({
            mapUrl, // optional
            map: importmap
        });

        const importmapResolve = map.resolve(specifier);
        
        const { parentURL = null } = context;

        // Normally Node.js would error on specifiers starting with 'https://', so
        // this hook intercepts them and converts them into absolute URLs to be
        // passed along to the later hooks below.
        if (importmapResolve) {
            if (importmapResolve.startsWith('https://')) {
                return {
                    shortCircuit: true,
                    url: importmapResolve,
                };
            }
            return nextResolve(importmapResolve);
        } else if (specifier.startsWith('https://')) {
            return {
                shortCircuit: true,
                url: specifier,
            };
        } else if (parentURL && parentURL.startsWith('https://')) {
            return {
                shortCircuit: true,
                url: new URL(specifier, parentURL).href,
            };
        }

        // Let Node.js handle all other specifiers.
        return nextResolve(specifier);
    } catch (error) {
        console.log('error: ', error)
    }
}
function fetchURL(url) {
    return new Promise((resolve, reject) => {
        get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({
                // This example assumes all network-provided JavaScript is ES module
                // code.
                format: 'module',
                shortCircuit: true,
                source: data,
            }));
        }).on('error', (err) => reject(err));
    });
}
export function load(url, context, nextLoad) {
    console.log('load url: ', url);
    console.log('load context: ', JSON.stringify(context, null, 2))
    console.log('load nextLoad: ', JSON.stringify(nextLoad, null, 2))
    // For JavaScript to be loaded over the network, we need to fetch and
    // return it.
    if (url.startsWith('https://')) {
        return fetchURL(url);
    }

    // Let Node.js handle all other URLs.
    return nextLoad(url);
}

export { resolve }