nodejs-utils
============

Custom errors for the Node.JS restify framework. Tests need Node.JS >= v5.10.0 to work.

If using TypeScript, install `typings` with:

    typings install github:SamuelMarks/nodejs-utils/nodejs-utils.d.ts --save

Otherwise just use the [nodejs-utils-dist](https://github.com/SamuelMarks/nodejs-utils-dist) compiled output.

## Miscellaneous

Clone [nodejs-utils-dist](https://github.com/SamuelMarks/nodejs-utils-dist) one dir above where this repo was cloned, then synchronise with:

    find -type f -not -name "*.ts" -and -not -path "./.git/*" -and -not -path "./node-modules/*" -and -not -name '*.map' | cpio -pdamv ../nodejs-utils-dist
