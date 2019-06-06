nodejs-utils
============

Custom errors for the Node.JS restify framework. Tests need Node.JS >= v5.10.0 to work.

If using TypeScript, install `typings` with:
 
    typings install github:SamuelMarks/nodejs-utils/nodejs-utils.d.ts --save

Otherwise just use the [nodejs-utils-dist](https://github.com/SamuelMarks/nodejs-utils-dist) compiled output.

## Miscellaneous

Clone [nodejs-utils-dist](https://github.com/SamuelMarks/nodejs-utils-dist) one dir above where this repo was cloned, then synchronise with:

    dst="${PWD##*/}"-dist;
    find -type f -not -path './node_modules*' -a -not -path './.git*' -a -not -path './.idea*' -a -not -path './typings*' -a -not -name '*.ts' -not -name 'ts*' | cpio -pdamv ../"$dst";
    m='Commit message'
    git commit -S -am "$m"
    git push origin master
    cd ../"$dst"
    git commit -S -am "$m"
    git push origin master

## License

Licensed under either of

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or <https://www.apache.org/licenses/LICENSE-2.0>)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or <https://opensource.org/licenses/MIT>)

at your option.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
