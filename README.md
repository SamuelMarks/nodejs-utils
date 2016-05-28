nodejs-utils
============

Custom errors for the Node.JS restify framework.

If using TypeScript, install `typings` with:

    typings install github:SamuelMarks/nodejs-utils/nodejs-utils.d.ts --save

Otherwise just use the [nodejs-utils-dist](https://github.com/SamuelMarks/nodejs-utils-dist) compiled output.

## Miscellaneous

Clone the dist repo in the same directory this repo was cloned into, then you can synchronise them with:

    find -type f -not -name "*.ts" -and -not -path "./.git/*" -and -not -path "./node-modules/*" -and -not -name '*.map' | cpio -pdamv ../nodejs-utils-dist
